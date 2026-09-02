import * as React from 'react';
import Header from '@/components/layout/Header';
import BottomNavigation from '../components/layout/BottomNavigation';
import MatchTable from '../components/ui/matchTable';
import { useGetCalendarsByDateQuery } from '../store/api/sportMonkApi';
import { useGetLeaguesByDateQuery } from '../store/api/syncedPoolDataApi';
import { useEffect, useState } from 'react';
// Importa il DatePicker che preferisci, qui esempio con react-datepicker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from "react-datepicker";
import it from 'date-fns/locale/it';
registerLocale('it', it);

type CalendarDate = {
    label: string;
    value: string;
    isToday?: boolean;
};

type CalendarioPartiteProps = {
    isHeaderVisible?: boolean;
};

function getDateArray(centerDate: string, days: number = 7): CalendarDate[] {
    const arr: CalendarDate[] = [];
    const center = new Date(centerDate);
    for (let i = -days; i <= days; i++) {
        const d = new Date(center);
        d.setDate(center.getDate() + i);
        arr.push({
            label: d.toLocaleDateString("it-IT", {
                weekday: "short",
                day: "2-digit",
                month: "short",
            }),
            value: d.toISOString().split("T")[0],
            isToday: d.toDateString() === new Date().toDateString(),
        });
    }
    return arr;
}

// Utility per calcolare quante date mostrare in base alla larghezza del contenitore
function useVisibleDates(minWidthPx = 90, gapPx = 8, sidePaddingPx = 32) {
    const [visibleCount, setVisibleCount] = useState(7);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function updateCount() {
            const width = containerRef.current?.offsetWidth || window.innerWidth;
            // Calcolo: spazio disponibile - padding, poi diviso larghezza minima + gap
            const available = width - sidePaddingPx;
            const count = Math.floor((available + gapPx) / (minWidthPx + gapPx));
            setVisibleCount(Math.max(3, count)); // almeno 3 date visibili
        }
        updateCount();
        window.addEventListener('resize', updateCount);
        return () => window.removeEventListener('resize', updateCount);
    }, []);

    return { visibleCount, containerRef };
}

const CalendarioPartite: React.FC<CalendarioPartiteProps> = ({ isHeaderVisible = false }) => {
    const [leagues, setLeagues] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [centerDate, setCenterDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [dateArray, setDateArray] = useState<CalendarDate[]>(getDateArray(new Date().toISOString().split('T')[0]));
    const [showCalendar, setShowCalendar] = useState(false);
    const [showSkeletonOnDateChange, setShowSkeletonOnDateChange] = useState(false);

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const daysRange = 7; // giorni a sinistra e destra del centro

    const { data, error, isLoading, isFetching, refetch } = useGetLeaguesByDateQuery(
        selectedDate,
        { pollingInterval: 10000 }
    );

    // Aggiorna la lista delle date quando cambia il centro
    React.useEffect(() => {
        setDateArray(getDateArray(centerDate, daysRange));
        // Dopo aver aggiornato la lista, scrolla all'inizio con smooth scroll CSS
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    }, [centerDate]);

    React.useEffect(() => {
        setLeagues(data?.FetchedCalendars?.data || []);
    }, [data]);

    // Quando cambi data, mostra skeleton
    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        setShowSkeletonOnDateChange(true);
    };

    // Quando arrivano i dati, nascondi skeleton
    useEffect(() => {
        if (!isLoading && !isFetching) {
            setShowSkeletonOnDateChange(false);
        }
    }, [isLoading, isFetching, data]);

    // Sposta la finestra delle date indietro (nuovo centro)
    const handlePrev = () => {
        const prev = new Date(centerDate);
        prev.setDate(prev.getDate() - daysRange - 1);
        setCenterDate(prev.toISOString().split('T')[0]);
    };

    // Sposta la finestra delle date avanti (nuovo centro)
    const handleNext = () => {
        const next = new Date(centerDate);
        next.setDate(next.getDate() + daysRange + 1);
        setCenterDate(next.toISOString().split('T')[0]);
    };

    const handleCalendarChange = (date: Date | null) => {
        if (!date) return;
        const iso = date.toISOString().split('T')[0];
        setShowCalendar(false);
        setCenterDate(iso);
        setSelectedDate(iso);
        // Centra la data selezionata con animazione
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }
        }, 100);
    };

    // Mostra skeleton solo al primo caricamento o quando cambi data manualmente
    // NON durante polling automatico
    const showSkeleton = isLoading || showSkeletonOnDateChange;

    // Hook per calcolare quante date mostrare
    const { visibleCount, containerRef } = useVisibleDates();

    // Genera solo le date visibili
    React.useEffect(() => {
        setDateArray(getDateArray(centerDate, Math.floor(visibleCount / 2)));
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    }, [centerDate, visibleCount]);

    return (
        <>
           
            <div className="max-w-full p-4 md:p-0">
                    <div className="flex items-center justify-between">
                        <p className="flex items-center gap-2 font-medium opacity-60">
                            {/* Spinner piccolo solo durante polling automatico, NON durante skeleton */}
                            {isFetching && !showSkeleton && (
                                <span className="inline-block w-4 h-4 ml-2 border-2 border-gray-300 rounded-full border-t-primary animate-spin"></span>
                            )}
                        </p>
                        <div className="relative flex pt-2">
                            <img
                                src="/icon/calendar.svg"
                                alt="calendar"
                                className="relative z-50 w-8 pr-1 cursor-pointer icon-base opacity-60"
                                onClick={() => setShowCalendar((v) => !v)}
                            />
                            {showCalendar && (
                                <div className="absolute right-0 z-40 pt-10 mt-2">
                                    <DatePicker
                                        selected={new Date(selectedDate)}
                                        onChange={handleCalendarChange}
                                        locale="it"
                                        dateFormat="dd/MM/yyyy"
                                        inline
                                        showYearDropdown
                                        showMonthDropdown
                                        dropdownMode="select"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    {/* SELETTORE DATE SEMPRE VISIBILE E SEMPRE UTILIZZABILE */}
                    <div
                        className="flex items-center justify-between w-full gap-2 mb-2"
                        ref={containerRef}
                    >
                        <div
                            className="grid p-2 bg-white border rounded-full cursor-pointer place-content-center"
                            onClick={handlePrev}
                        >
                            <img className='rotate-90' src="/icon/arrow.svg" alt="arrow" />
                        </div>
                        <div
                            className="flex flex-1 gap-2 overflow-x-hidden transition-all duration-300 no-scrollbar scroll-smooth"
                            ref={scrollRef}
                        >
                            {dateArray.map((d) => (
                                <div
                                    key={d.value}
                                    className={
                                        "min-w-[90px] flex-shrink-0 cursor-pointer rounded-full px-3 py-2 text-center transition-colors duration-200 " +
                                        (d.value === selectedDate
                                            ? "bg-primary font-medium text-white"
                                            : "border")
                                    }
                                    onClick={() => handleDateChange(d.value)}
                                >
                                    {d.label}
                                </div>
                            ))}
                        </div>
                        <div
                            className="grid p-2 bg-white border rounded-full cursor-pointer place-content-center"
                            onClick={handleNext}
                        >
                            <img className='-rotate-90' src="/icon/arrow.svg" alt="arrow" />
                        </div>
                    </div>
                    {/* SKELETON O CONTENUTO */}
                    {showSkeleton ? (
                        <div className="mt-2 bg-white rounded-lg default-card-padding">
                            <div className="space-y-3">
                                <div className="w-1/3 h-4 mb-2 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                                        <div className="flex-1 h-6 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                                        <div className="w-12 h-6 rounded bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className='pb-12 bg-transparent'>
                            <div className='bg-white default-card-padding'>
                                <MatchTable
                                    data={leagues || []}
                                    sectionHeader="Calendario Partite"
                                    sectionDescription="Tutte le partite in programma, divise per lega"
                                />
                            </div>
                        </div>

                    )}
            </div>
            
        </>
    );
}

export default CalendarioPartite;