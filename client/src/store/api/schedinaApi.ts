import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Schedina {
    _id?: string;
    pronostici: any[]; // Puoi specificare meglio il tipo se conosci la struttura dei pronostici
    userId?: string;
    legaId: {
        _id: string;
        nome: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export const schedinaApi = createApi({
    reducerPath: "schedinaApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", // Assicurati che il baseUrl corrisponda al backend
    }),
    endpoints: (builder) => ({
        // Endpoint per creare una schedina
        createSchedina: builder.mutation<Schedina, { pronostici: any[]; legaId: string }>({
            query: (body) => ({
                url: "/api/schedine",
                method: "POST",
                credentials: "include", // Assicurati di includere le credenziali per le sessioni
                body,
            }),
        }),
        getUserSchedine: builder.query<Schedina[], void>({
            query: () => ({
                url: `/api/schedine/user`,
                method: "GET",
                credentials: "include", // Assicurati di includere le credenziali per le sessioni
            }),
        }),
    }),
});

export const { useCreateSchedinaMutation, useGetUserSchedineQuery } = schedinaApi;
export default schedinaApi;


/*import React, { useState } from "react";
import { useCreateSchedinaMutation } from "../store/api/schedinaApi";

const CreateSchedinaForm: React.FC = () => {
    const [pronostici, setPronostici] = useState<any[]>([]);
    const [legaId, setLegaId] = useState<string>("");
    const [createSchedina, { isLoading, isError, isSuccess }] = useCreateSchedinaMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await createSchedina({ pronostici, legaId }).unwrap();
            console.log("Schedina creata con successo:", response);
        } catch (error) {
            console.error("Errore nella creazione della schedina:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Lega ID:</label>
                <input
                    type="text"
                    value={legaId}
                    onChange={(e) => setLegaId(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Pronostici:</label>
                <textarea
                    value={JSON.stringify(pronostici)}
                    onChange={(e) => setPronostici(JSON.parse(e.target.value))}
                    required
                />
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? "Creazione in corso..." : "Crea Schedina"}
            </button>
            {isError && <p>Errore nella creazione della schedina.</p>}
            {isSuccess && <p>Schedina creata con successo!</p>}
        </form>
    );
};

export default CreateSchedinaForm;*/