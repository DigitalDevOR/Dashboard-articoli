import { CSSProperties, type ChangeEvent, type FormEvent, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    Bold,
    Code2,
    Eye,
    FileText,
    ImageOff,
    Italic,
    Link,
    List,
    Pencil,
    Plus,
    RefreshCw,
    Send,
    Trash2,
    Upload,
    X,
} from 'lucide-react';

import type {
    BulkDeletePostsResponse,
    Post,
    PostFilters,
    PostInput,
    PostStatus,
} from '../api/posts.api';

import { Button } from '../components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

import { getErrorMessage } from '../lib/errorMessage';
import { hasPermission, isSuperAdmin } from '../lib/permissions';
import { useToastStore } from '../store/toast.store';

import { useCurrentUser } from '../queries/auth.queries';
import {
    useBulkDeletePosts,
    useCreatePost,
    useDeletePost,
    usePosts,
    usePublishPost,
    useUpdatePost,
} from '../queries/posts.queries';
import { useWordpressSites } from '../queries/wordpressSites.queries';

const maxBulkDeletePosts = 100;

const statusLabels: Record<PostStatus, string> = {
    publish: 'Pubblicato',
    draft: 'Bozza',
    pending: 'In revisione',
    private: 'Privato',
    future: 'Programmato',
};

function getUserSiteId(
    siteId: string | { _id: string } | undefined
) {
    return typeof siteId === 'string'
        ? siteId
        : siteId?._id ?? '';
}

function statusClass(status: PostStatus) {
    if (status === 'publish') {
        return 'bg-emerald-100 text-emerald-700';
    }

    return 'bg-muted text-muted-foreground';
}

function ImagePreview({
    imageUrl,
    className = 'h-16 w-24',
    style,
}: {
    imageUrl?: string;
    className?: string;
    style?: CSSProperties
}) {
    const [hasError, setHasError] = useState(false);
    
    useEffect(() => {
        setHasError(false);
    }, [imageUrl]);

    const hasImage = Boolean(imageUrl?.trim()) && !hasError;

    if (!hasImage) {
        return (
            <div
                className={`flex ${className} shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed bg-muted/40 p-2 text-center text-[10px] text-muted-foreground`}
            >
                <ImageOff className="h-4 w-4" />
                <span>Immagine non caricata</span>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt=""
            style={style}
            className={`${className} shrink-0 rounded-md border object-cover hover:w-96 hover:h-auto hover:absolute transition-all duration-100`}
            onError={() => setHasError(true)}
        />
    );
}

function ImageUpload({ imageUrl, style }: { imageUrl?: string, style?: CSSProperties }) {
    const [previewUrl, setPreviewUrl] = useState(imageUrl);
    const [fileName, setFileName] = useState('Nessuna nuova immagine');

    useEffect(() => {
        setPreviewUrl(imageUrl);
    }, [imageUrl]);

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;

        const nextPreviewUrl = URL.createObjectURL(file);
        setFileName(file.name);
        setPreviewUrl((currentPreviewUrl) => {
            if (currentPreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(currentPreviewUrl);
            return nextPreviewUrl;
        });
    }

    useEffect(() => () => {
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    return (
        <div className="space-y-3">
            <ImagePreview style={style} imageUrl={previewUrl} className="h-32 w-full max-w-xs" />
            <div className="flex flex-wrap items-center gap-3">
                <Input id="imageFile" name="imageFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} className="sr-only" />
                <label htmlFor="imageFile" className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring">
                    <Upload className="h-4 w-4" />
                    {imageUrl ? 'Cambia immagine' : 'Carica immagine'}
                </label>
                <span className="max-w-[18rem] truncate text-sm text-muted-foreground" title={fileName}>{fileName}</span>
            </div>
            <p className="text-xs text-muted-foreground">L’immagine viene caricata solo quando salvi l’articolo.</p>
        </div>
    );
}

function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Impossibile leggere l’immagine selezionata.'));
        reader.readAsDataURL(file);
    });
}

function formatHtml(html: string) {
    const tokens =
        html
            .replace(/>\s+</g, '><')
            .trim()
            .match(/<!--[^]*?-->|<[^>]+>|[^<]+/g) ?? [];

    const lines: string[] = [];

    let indentation = 0;

    const inlineTags = new Set([
        'a',
        'abbr',
        'b',
        'br',
        'code',
        'em',
        'i',
        'img',
        'label',
        'small',
        'span',
        'strong',
        'sub',
        'sup',
    ]);

    const selfClosingTags = new Set([
        'area',
        'base',
        'br',
        'col',
        'embed',
        'hr',
        'img',
        'input',
        'link',
        'meta',
        'param',
        'source',
        'track',
        'wbr',
    ]);

    for (const token of tokens) {
        const trimmedToken = token.trim();

        if (!trimmedToken) {
            continue;
        }

        if (trimmedToken.startsWith('</')) {
            const tagName =
                trimmedToken
                    .match(/^<\/\s*([a-z0-9]+)/i)?.[1]
                    ?.toLowerCase() ?? '';

            if (inlineTags.has(tagName) && lines.length > 0) {
                lines[lines.length - 1] += trimmedToken;
            } else {
                indentation = Math.max(0, indentation - 1);

                lines.push(
                    `${'  '.repeat(indentation)}${trimmedToken}`
                );
            }

            continue;
        }

        if (
            trimmedToken.startsWith('<') &&
            !trimmedToken.startsWith('<!--')
        ) {
            const tagName =
                trimmedToken
                    .match(/^<\s*([a-z0-9]+)/i)?.[1]
                    ?.toLowerCase() ?? '';

            const isInline = inlineTags.has(tagName);

            const isSelfClosing =
                trimmedToken.endsWith('/>') ||
                selfClosingTags.has(tagName);

            if (
                isInline &&
                lines.length > 0 &&
                !lines[lines.length - 1].endsWith('>')
            ) {
                lines[lines.length - 1] += trimmedToken;
            } else {
                lines.push(
                    `${'  '.repeat(indentation)}${trimmedToken}`
                );
            }

            if (!isInline && !isSelfClosing) {
                indentation += 1;
            }

            continue;
        }

        const text = trimmedToken.replace(/\s+/g, ' ');

        if (text) {
            if (
                lines.length > 0 &&
                !lines[lines.length - 1].endsWith('>')
            ) {
                lines[lines.length - 1] += ` ${text}`;
            } else {
                lines.push(
                    `${'  '.repeat(indentation)}${text}`
                );
            }
        }
    }

    return lines.join('\n');
}

function HtmlEditor({
    defaultValue = '',
}: {
    defaultValue?: string;
}) {
    const [content, setContent] = useState(() =>
        formatHtml(defaultValue)
    );

    const [view, setView] = useState<'html' | 'preview'>('html');

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setContent(formatHtml(defaultValue ?? ''));
        setView('html');
    }, [defaultValue]);

    function insertMarkup(before: string, after = '') {
        const textarea = textareaRef.current;

        if (!textarea) {
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const selectedText =
            content.slice(start, end) || 'testo';

        const nextContent = `${content.slice(
            0,
            start
        )}${before}${selectedText}${after}${content.slice(end)}`;

        setContent(nextContent);

        requestAnimationFrame(() => {
            textarea.focus();

            const cursorPosition =
                start +
                before.length +
                selectedText.length +
                after.length;

            textarea.setSelectionRange(
                cursorPosition,
                cursorPosition
            );
        });
    }

    return (
        <div className="overflow-hidden rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 p-2">
                <div className="flex flex-wrap items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 gap-1 px-2 text-xs"
                        onClick={() =>
                            insertMarkup(
                                '<strong>',
                                '</strong>'
                            )
                        }
                        title="Testo in grassetto"
                    >
                        <Bold className="h-3.5 w-3.5" />
                        Grassetto
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 gap-1 px-2 text-xs"
                        onClick={() =>
                            insertMarkup('<em>', '</em>')
                        }
                        title="Testo in corsivo"
                    >
                        <Italic className="h-3.5 w-3.5" />
                        Corsivo
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 gap-1 px-2 text-xs"
                        onClick={() =>
                            insertMarkup(
                                '<a href="">',
                                '</a>'
                            )
                        }
                        title="Inserisci link"
                    >
                        <Link className="h-3.5 w-3.5" />
                        Link
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 gap-1 px-2 text-xs"
                        onClick={() =>
                            insertMarkup(
                                '<ul>\n  <li>',
                                '</li>\n</ul>'
                            )
                        }
                        title="Inserisci elenco"
                    >
                        <List className="h-3.5 w-3.5" />
                        Elenco
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        className="h-8 gap-1 px-2 text-xs"
                        onClick={() =>
                            setContent(formatHtml(content))
                        }
                        title="Formatta il codice HTML"
                    >
                        <Code2 className="h-3.5 w-3.5" />
                        Formatta HTML
                    </Button>
                </div>

                <div className="flex rounded-md border bg-background p-0.5">
                    <Button
                        type="button"
                        variant={
                            view === 'html'
                                ? 'default'
                                : 'ghost'
                        }
                        className="h-8 gap-1 px-2 text-xs"
                        onClick={() => setView('html')}
                    >
                        <Code2 className="h-3.5 w-3.5" />
                        HTML
                    </Button>

                    <Button
                        type="button"
                        variant={
                            view === 'preview'
                                ? 'default'
                                : 'ghost'
                        }
                        className="h-8 gap-1 px-2 text-xs"
                        onClick={() => setView('preview')}
                    >
                        <Eye className="h-3.5 w-3.5" />
                        Anteprima
                    </Button>
                </div>
            </div>

            {view === 'html' ? (
                <textarea
                    ref={textareaRef}
                    id="content"
                    name="content"
                    value={content}
                    onChange={(event) =>
                        setContent(event.target.value)
                    }
                    placeholder="Scrivi il contenuto HTML dell'articolo..."
                    required
                    className="min-h-64 w-full resize-y border-0 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-0"
                    spellCheck={false}
                />
            ) : (
                <div className="min-h-64 bg-white p-4">
                    {content.trim() ? (
                        <iframe
                            title="Anteprima contenuto HTML"
                            srcDoc={content}
                            sandbox=""
                            className="h-64 w-full border-0"
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Nessun contenuto da visualizzare.
                        </p>
                    )}
                </div>
            )}

            <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                Il contenuto viene salvato come HTML.
            </div>
        </div>
    );
}

export default function Articoli() {
    const currentUserQuery = useCurrentUser();
    const user = currentUserQuery.data;

    const superAdmin = isSuperAdmin(user);

    const sitesQuery = useWordpressSites(superAdmin);

    const userSiteId = getUserSiteId(
        user?.siteAccess?.siteId
    );

    const [selectedSiteId, setSelectedSiteId] =
        useState('');

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number | 'all'>(10);
    const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
    const [bulkDeleteFailures, setBulkDeleteFailures] =
        useState<BulkDeletePostsResponse['failedPosts']>([]);

    const [filters, setFilters] = useState<PostFilters>({
        title: '',
        category: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    });

    const [editingPost, setEditingPost] =
        useState<Post | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        if (superAdmin) {
            if (
                !selectedSiteId &&
                sitesQuery.data?.[0]?._id
            ) {
                setSelectedSiteId(
                    sitesQuery.data[0]._id
                );
            }
        } else if (userSiteId) {
            setSelectedSiteId(userSiteId);
        }
    }, [
        selectedSiteId,
        sitesQuery.data,
        superAdmin,
        userSiteId,
    ]);

    useEffect(() => {
        if (!editingPost) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow =
                previousOverflow;
        };
    }, [editingPost]);

    const postsQuery = usePosts(
        selectedSiteId,
        page,
        pageSize,
        filters
    );

    const createMutation = useCreatePost();
    const updateMutation = useUpdatePost();
    const deleteMutation = useDeletePost();
    const bulkDeleteMutation = useBulkDeletePosts();
    const publishMutation = usePublishPost();

    const canRead = hasPermission(user, 'post:read');
    const canCreate = hasPermission(
        user,
        'post:create'
    );
    const canUpdate = hasPermission(
        user,
        'post:update'
    );
    const canDelete = hasPermission(
        user,
        'post:delete'
    );
    const canPublish = hasPermission(
        user,
        'post:publish'
    );

    const activeMutation =
        createMutation.isPending ||
        updateMutation.isPending;

    function resetForm() {
        setEditingPost(null);
        setIsFormOpen(false);

        createMutation.reset();
        updateMutation.reset();
    }

    function handleSiteChange(siteId: string) {
        setSelectedSiteId(siteId);
        setPage(1);
        setSelectedPostIds([]);
        setBulkDeleteFailures([]);
        resetForm();
    }

    function handleFilterChange(
        field: keyof PostFilters,
        value: string
    ) {
        setFilters((currentFilters) => ({
            ...currentFilters,
            [field]: value,
        }));

        setPage(1);
        setSelectedPostIds([]);
        setBulkDeleteFailures([]);
    }

    function clearFilters() {
        setFilters({
            title: '',
            category: '',
            status: '',
            dateFrom: '',
            dateTo: '',
        });

        setPage(1);
        setSelectedPostIds([]);
        setBulkDeleteFailures([]);
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!selectedSiteId) {
            return;
        }

        const formData = new FormData(
            event.currentTarget
        );

        const imageFile = formData.get('imageFile');

        const input: PostInput = {
            title: String(
                formData.get('title') ?? ''
            ).trim(),

            content: String(
                formData.get('content') ?? ''
            ),

            category: String(
                formData.get('category') ?? ''
            ).trim(),

            excerpt: String(
                formData.get('excerpt') ?? ''
            ).trim(),

            slug:
                String(
                    formData.get('slug') ?? ''
                ).trim() || undefined,

            status: String(
                formData.get('status') ?? 'draft'
            ) as PostStatus,

            imageUrl: editingPost?.imageUrl,
        };

        if (imageFile instanceof File && imageFile.size > 0) {
            input.imageData = await fileToDataUrl(imageFile);
            input.imageFileName = imageFile.name;
            input.imageContentType = imageFile.type;
        }

        if (editingPost) {
            updateMutation.mutate(
                {
                    siteId: selectedSiteId,
                    postId: editingPost._id,
                    input,
                },
                {
                    onSuccess: resetForm,
                }
            );
        } else {
            createMutation.mutate(
                {
                    siteId: selectedSiteId,
                    input,
                },
                {
                    onSuccess: resetForm,
                }
            );
        }
    }

    function handleDelete(post: Post) {
        if (
            selectedSiteId &&
            window.confirm(
                `Eliminare definitivamente "${post.title}"? Questa azione non puo essere annullata.`
            )
        ) {
            deleteMutation.mutate(
                {
                    siteId: selectedSiteId,
                    postId: post._id,
                },
                {
                    onSuccess: () => {
                        setSelectedPostIds((currentSelection) =>
                            currentSelection.filter((id) => id !== post._id)
                        );
                    },
                }
            );
        }
    }

    function togglePostSelection(postId: string) {
        if (
            !selectedPostIds.includes(postId) &&
            selectedPostIds.length >= maxBulkDeletePosts
        ) {
            useToastStore.getState().addToast({
                title: 'Limite di selezione raggiunto',
                description: `Puoi selezionare al massimo ${maxBulkDeletePosts} articoli per volta.`,
                variant: 'error',
            });
            return;
        }

        setSelectedPostIds((currentSelection) =>
            currentSelection.includes(postId)
                ? currentSelection.filter((id) => id !== postId)
                : [...currentSelection, postId]
        );
    }

    function togglePageSelection(posts: Post[]) {
        const pagePostIds = posts.map((post) => post._id);
        const allSelected = pagePostIds.every((id) =>
            selectedPostIds.includes(id)
        );

        const newPostIds = pagePostIds.filter(
            (id) => !selectedPostIds.includes(id)
        );

        if (
            !allSelected &&
            selectedPostIds.length + newPostIds.length > maxBulkDeletePosts
        ) {
            useToastStore.getState().addToast({
                title: 'Limite di selezione raggiunto',
                description: `Puoi selezionare al massimo ${maxBulkDeletePosts} articoli per volta.`,
                variant: 'error',
            });
            return;
        }

        setSelectedPostIds((currentSelection) =>
            allSelected
                ? currentSelection.filter((id) => !pagePostIds.includes(id))
                : [
                    ...new Set([
                        ...currentSelection,
                        ...pagePostIds.filter(
                            (id) => !currentSelection.includes(id)
                        ),
                    ]),
                ]
        );
    }

    function handleBulkDelete() {
        if (
            !selectedSiteId ||
            selectedPostIds.length === 0 ||
            !window.confirm(
                `Eliminare definitivamente ${selectedPostIds.length} post selezionati? Questa azione non puo essere annullata.`
            )
        ) {
            return;
        }

        setBulkDeleteFailures([]);
        bulkDeleteMutation.mutate(
            {
                siteId: selectedSiteId,
                postIds: selectedPostIds,
            },
            {
                onSuccess: (response) => {
                    setSelectedPostIds([]);
                    setBulkDeleteFailures(response.failedPosts);
                },
                onError: (error) => {
                    if (axios.isAxiosError<BulkDeletePostsResponse>(error)) {
                        setBulkDeleteFailures(
                            error.response?.data?.failedPosts ?? []
                        );
                    }
                },
            }
        );
    }

    function handlePublish(post: Post) {
        if (
            selectedSiteId &&
            window.confirm(
                `Pubblicare "${post.title}" su WordPress?`
            )
        ) {
            publishMutation.mutate({
                siteId: selectedSiteId,
                postId: post._id,
            });
        }
    }

    if (currentUserQuery.isPending) {
        return (
            <p className="text-sm text-muted-foreground">
                Verifica autorizzazioni...
            </p>
        );
    }

    if (!canRead) {
        return (
            <p
                className="text-sm text-destructive"
                role="alert"
            >
                Non sei autorizzato a leggere i post.
            </p>
        );
    }

    const mutationError =
        createMutation.error ??
        updateMutation.error ??
        deleteMutation.error ??
        publishMutation.error;

    const selectedSite = sitesQuery.data?.find(
        (site) => site._id === selectedSiteId
    );

    return (
        <section className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-primary">
                        <FileText className="h-5 w-5" />

                        <span className="text-sm font-medium">
                            Contenuti
                        </span>
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight">
                        Upload articoli
                    </h2>

                    <p className="text-muted-foreground">
                        Gestisci le bozze e pubblica gli
                        articoli sui tuoi siti WordPress.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                        onClick={() =>
                            postsQuery.refetch()
                        }
                        disabled={
                            !selectedSiteId ||
                            postsQuery.isFetching
                        }
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                postsQuery.isFetching
                                    ? 'animate-spin'
                                    : ''
                            }`}
                        />

                        Aggiorna
                    </Button>

                    {canCreate && (
                        <Button
                            type="button"
                            className="gap-2"
                            onClick={() => {
                                setEditingPost(null);
                                setIsFormOpen(true);
                            }}
                            disabled={!selectedSiteId}
                        >
                            <Plus className="h-4 w-4" />
                            Nuovo articolo
                        </Button>
                    )}

                </div>
            </div>

            {bulkDeleteFailures.length > 0 && (
                <div
                    className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm"
                    role="alert"
                >
                    <p className="font-medium text-destructive">
                        {bulkDeleteFailures.length === 1
                            ? 'Un post non è stato eliminato:'
                            : `${bulkDeleteFailures.length} post non sono stati eliminati:`}
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                        {bulkDeleteFailures.map((failure) => (
                            <li key={failure.postId}>
                                {failure.title ?? failure.postId}: {failure.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <Card>
                <CardHeader className="gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <CardTitle className="text-lg">
                            Sito di pubblicazione
                        </CardTitle>

                        <CardDescription>
                            {superAdmin
                                ? 'Scegli il sito su cui operare.'
                                : 'Sito associato al tuo account.'}
                        </CardDescription>
                    </div>

                    {superAdmin ? (
                        <div className="w-full sm:max-w-sm">
                            <Label htmlFor="post-site">
                                Sito WordPress
                            </Label>

                            <Select
                                id="post-site"
                                className="mt-2"
                                value={selectedSiteId}
                                onChange={(event) =>
                                    handleSiteChange(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Seleziona un sito
                                </option>

                                {sitesQuery.data?.map(
                                    (site) => (
                                        <option
                                            key={site._id}
                                            value={site._id}
                                        >
                                            {site.name}
                                        </option>
                                    )
                                )}
                            </Select>
                        </div>
                    ) : (
                        <p className="text-sm font-medium">
                            {selectedSiteId ||
                                'Nessun sito associato'}
                        </p>
                    )}
                </CardHeader>

                {selectedSite && (
                    <CardContent className="pt-0 text-xs text-muted-foreground">
                        {selectedSite.wpUrl}
                    </CardContent>
                )}
            </Card>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                            <CardTitle className="text-lg">
                                Filtra articoli
                            </CardTitle>

                            <CardDescription>
                                Usa uno o piu filtri per
                                restringere l&apos;elenco.
                            </CardDescription>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={clearFilters}
                            disabled={
                                !filters.title &&
                                !filters.category &&
                                !filters.status &&
                                !filters.dateFrom &&
                                !filters.dateTo
                            }
                        >
                            Azzera filtri
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <div className="space-y-2">
                        <Label htmlFor="filter-title">
                            Titolo
                        </Label>

                        <Input
                            id="filter-title"
                            value={filters.title}
                            onChange={(event) =>
                                handleFilterChange(
                                    'title',
                                    event.target.value
                                )
                            }
                            placeholder="Cerca per titolo"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="filter-category">
                            Categoria
                        </Label>

                        <Input
                            id="filter-category"
                            value={filters.category}
                            onChange={(event) =>
                                handleFilterChange(
                                    'category',
                                    event.target.value
                                )
                            }
                            placeholder="Cerca per categoria"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="filter-status">
                            Stato
                        </Label>

                        <Select
                            id="filter-status"
                            value={filters.status}
                            onChange={(event) =>
                                handleFilterChange(
                                    'status',
                                    event.target.value
                                )
                            }
                        >
                            <option value="">
                                Tutti gli stati
                            </option>
                            <option value="draft">
                                Bozza
                            </option>
                            <option value="publish">
                                Pubblicato
                            </option>
                            <option value="pending">
                                In revisione
                            </option>
                            <option value="private">
                                Privato
                            </option>
                            <option value="future">
                                Programmato
                            </option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="filter-date-from">
                            Data da
                        </Label>

                        <Input
                            id="filter-date-from"
                            type="date"
                            value={filters.dateFrom}
                            onChange={(event) =>
                                handleFilterChange(
                                    'dateFrom',
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="filter-date-to">
                            Data a
                        </Label>

                        <Input
                            id="filter-date-to"
                            type="date"
                            value={filters.dateTo}
                            onChange={(event) =>
                                handleFilterChange(
                                    'dateTo',
                                    event.target.value
                                )
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {isFormOpen &&
                (canCreate ||
                    Boolean(editingPost && canUpdate)) && (
                    <div
                        style={{ marginTop: 0 }}
                        className={
                            editingPost
                                ? ' fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-slate-950/50 p-4 sm:p-6'
                                : undefined
                        }
                        role={
                            editingPost
                                ? 'dialog'
                                : undefined
                        }
                        aria-modal={
                            editingPost
                                ? true
                                : undefined
                        }
                        aria-labelledby={
                            editingPost
                                ? 'edit-post-title'
                                : undefined
                        }
                    >
                        <Card
                            className={
                                editingPost
                                    ? 'mx-auto min-h-full max-w-5xl shadow-2xl sm:min-h-0'
                                    : undefined
                            }
                        >
                            <CardHeader className="flex-row items-start justify-between">
                                <div>
                                    <CardTitle
                                        id={
                                            editingPost
                                                ? 'edit-post-title'
                                                : undefined
                                        }
                                        className="text-lg"
                                    >
                                        {editingPost
                                            ? 'Modifica articolo'
                                            : 'Nuovo articolo'}
                                    </CardTitle>

                                    <CardDescription>
                                        Il contenuto viene
                                        salvato come bozza se
                                        non selezioni uno stato
                                        diverso.
                                    </CardDescription>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    aria-label="Chiudi form"
                                    onClick={resetForm}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>

                            <CardContent>
                                <form
                                    className="grid gap-4"
                                    onSubmit={handleSubmit}
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="title">
                                                Titolo
                                            </Label>

                                            <Input
                                                id="title"
                                                name="title"
                                                defaultValue={
                                                    editingPost?.title
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="content">
                                                Contenuto HTML
                                            </Label>

                                            <HtmlEditor
                                                defaultValue={
                                                    editingPost?.content
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="excerpt">
                                                Excerpt
                                            </Label>

                                            <Textarea
                                                id="excerpt"
                                                name="excerpt"
                                                className="min-h-20"
                                                defaultValue={
                                                    editingPost?.excerpt
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="slug">
                                                Slug opzionale
                                            </Label>

                                            <Input
                                                id="slug"
                                                name="slug"
                                                defaultValue={
                                                    editingPost?.slug
                                                }
                                                placeholder="Generato dal titolo"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">
                                                Categoria
                                            </Label>

                                            <Input
                                                id="category"
                                                name="category"
                                                defaultValue={
                                                    editingPost?.category
                                                }
                                                placeholder="Es. Politica"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="status">
                                                Stato
                                            </Label>

                                            <Select
                                                id="status"
                                                name="status"
                                                defaultValue={
                                                    editingPost?.status ??
                                                    'draft'
                                                }
                                            >
                                                <option value="publish">
                                                    Pubblicato
                                                </option>

                                                <option value="draft">
                                                    Bozza
                                                </option>

                                                <option value="pending">
                                                    In revisione
                                                </option>

                                                <option value="private">
                                                    Privato
                                                </option>

                                                <option value="future">
                                                    Programmato
                                                </option>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="imageFile">
                                                Immagine in evidenza
                                            </Label>

                                            <ImageUpload
                                                imageUrl={editingPost?.imageUrl}
                                                style={{
                                                    position: 'relative',
                                                    width: '300px',
                                                    height: 'auto',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {mutationError && (
                                        <p
                                            className="text-sm text-destructive"
                                            role="alert"
                                        >
                                            {getErrorMessage(
                                                mutationError
                                            )}
                                        </p>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={
                                                resetForm
                                            }
                                        >
                                            Annulla
                                        </Button>

                                        <Button
                                            type="submit"
                                            disabled={
                                                activeMutation
                                            }
                                        >
                                            {activeMutation
                                                ? 'Salvataggio...'
                                                : 'Salva articolo'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

            {sitesQuery.isError && (
                <p
                    className="text-sm text-destructive"
                    role="alert"
                >
                    {getErrorMessage(
                        sitesQuery.error,
                        'Impossibile recuperare i siti.'
                    )}
                </p>
            )}

            {postsQuery.isError && (
                <p
                    className="text-sm text-destructive"
                    role="alert"
                >
                    {getErrorMessage(
                        postsQuery.error,
                        'Impossibile recuperare i post.'
                    )}
                </p>
            )}

            {!selectedSiteId && (
                <Card>
                    <CardContent className="p-10 text-center text-sm text-muted-foreground">
                        Seleziona un sito WordPress per
                        visualizzare gli articoli.
                    </CardContent>
                </Card>
            )}

            {selectedSiteId &&
                postsQuery.isPending && (
                    <Card>
                        <CardContent className="p-10 text-center text-sm text-muted-foreground">
                            Caricamento articoli...
                        </CardContent>
                    </Card>
                )}

            {selectedSiteId &&
                postsQuery.isSuccess &&
                postsQuery.data.posts.length === 0 && (
                    <Card>
                        <CardContent className="p-10 text-center text-sm text-muted-foreground">
                            Nessun articolo per questo
                            sito.
                        </CardContent>
                    </Card>
                )}

            {selectedSiteId &&
                postsQuery.isSuccess &&
                postsQuery.data.posts.length > 0 && (
                    <Card className="overflow-hidden">
                        {canDelete && selectedPostIds.length > 0 && (
                            <div className="flex items-center justify-between border-b px-5 py-3">
                                <span className="text-sm text-muted-foreground">
                                    {selectedPostIds.length} articoli selezionati
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="gap-2 text-destructive hover:text-destructive"
                                    onClick={handleBulkDelete}
                                    disabled={bulkDeleteMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {bulkDeleteMutation.isPending
                                        ? 'Eliminazione...'
                                        : 'Elimina selezionati'}
                                </Button>
                            </div>
                        )}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-sm">
                                <thead className="border-b bg-muted/40 text-left">
                                    <tr>
                                        {canDelete && (
                                            <th className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    aria-label="Seleziona tutti gli articoli di questa pagina"
                                                    checked={
                                                        postsQuery.data.posts.length > 0 &&
                                                        postsQuery.data.posts.every(
                                                            (post) =>
                                                                selectedPostIds.includes(
                                                                    post._id
                                                                )
                                                        )
                                                    }
                                                    onChange={() =>
                                                        togglePageSelection(
                                                            postsQuery.data.posts
                                                        )
                                                    }
                                                    disabled={
                                                        bulkDeleteMutation.isPending
                                                    }
                                                    className="h-4 w-4 rounded border-input accent-primary"
                                                />
                                            </th>
                                        )}
                                        <th className="px-5 py-3 font-medium">
                                            Immagine
                                        </th>

                                        <th className="px-5 py-3 font-medium">
                                            Titolo
                                        </th>

                                        <th className="px-5 py-3 font-medium">
                                            Categoria
                                        </th>

                                        <th className="px-5 py-3 font-medium">
                                            Stato
                                        </th>

                                        <th className="px-5 py-3 font-medium">
                                            Data
                                        </th>

                                        <th className="px-5 py-3 text-right font-medium">
                                            Azioni
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {postsQuery.data.posts.map(
                                        (post) => (
                                            <tr
                                                key={
                                                    post._id
                                                }

                                                className='h-24'
                                            >
                                                {canDelete && (
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="checkbox"
                                                            aria-label={`Seleziona ${post.title}`}
                                                            checked={selectedPostIds.includes(
                                                                post._id
                                                            )}
                                                            onChange={() =>
                                                                togglePostSelection(
                                                                    post._id
                                                                )
                                                            }
                                                            disabled={
                                                                bulkDeleteMutation.isPending
                                                            }
                                                            className="h-4 w-4 rounded border-input accent-primary"
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-5 py-4 hover:w-80 hover:absolute transition-transform duration-75 w-fit flow-root">
                                                    <ImagePreview
                                                        imageUrl={
                                                            post.imageUrl
                                                        }
                                                    />
                                                </td>

                                                <td className="max-w-md px-5 py-4">
                                                    <p className="truncate font-medium">
                                                        {
                                                            post.title
                                                        }
                                                    </p>

                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {
                                                            post.slug
                                                        }
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    {post.category || '-'}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                                                            post.status
                                                        )}`}
                                                    >
                                                        {
                                                            statusLabels[
                                                                post
                                                                    .status
                                                            ] ?? 'Non disponibile'
                                                        }
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-muted-foreground">
                                                    {new Date(
                                                        post.createdAt
                                                    ).toLocaleDateString(
                                                        'it-IT'
                                                    )}
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {canUpdate && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                className="gap-1"
                                                                onClick={() => {
                                                                    setEditingPost(
                                                                        post
                                                                    );
                                                                    setIsFormOpen(
                                                                        true
                                                                    );
                                                                }}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                Modifica
                                                            </Button>
                                                        )}

                                                        {canPublish &&
                                                            post.status !==
                                                                'publish' && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    className="gap-1 text-emerald-700 hover:text-emerald-700"
                                                                    onClick={() =>
                                                                        handlePublish(
                                                                            post
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        publishMutation.isPending
                                                                    }
                                                                >
                                                                    <Send className="h-4 w-4" />
                                                                    Pubblica
                                                                </Button>
                                                            )}

                                                        {canDelete && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                className="gap-1 text-destructive hover:text-destructive"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        post
                                                                    )
                                                                }
                                                                disabled={
                                                                    deleteMutation.isPending ||
                                                                    bulkDeleteMutation.isPending
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                Elimina
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 border-t px-5 py-4 text-sm">
                            <div className="flex flex-wrap items-center gap-4">
                                <label className="flex items-center gap-2 text-muted-foreground">
                                    Mostra
                                    <Select
                                        aria-label="Numero di articoli visibili"
                                        className="w-auto"
                                        value={pageSize}
                                        onChange={(event) => {
                                            const value = event.target.value;
                                            setPageSize(
                                                value === 'all'
                                                    ? 'all'
                                                    : Number(value)
                                            );
                                            setPage(1);
                                        }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={100}>100</option>
                                        <option value="all">Tutti</option>
                                    </Select>
                                    articoli
                                </label>

                                <span className="text-muted-foreground">
                                    {pageSize === 'all'
                                        ? 'Tutti gli articoli'
                                        : `Pagina ${postsQuery.data.pagination.page} di ${Math.max(postsQuery.data.pagination.totalPages, 1)}`}
                                    {' · '}
                                    {postsQuery.data.pagination.totalPosts} articoli
                                </span>
                            </div>

                            {pageSize !== 'all' && (
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setPage((value) => value - 1)
                                        }
                                        disabled={
                                            !postsQuery.data.pagination
                                                .hasPreviousPage
                                        }
                                    >
                                        Precedente
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setPage((value) => value + 1)
                                        }
                                        disabled={
                                            !postsQuery.data.pagination
                                                .hasNextPage
                                        }
                                    >
                                        Successiva
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
        </section>
    );
}