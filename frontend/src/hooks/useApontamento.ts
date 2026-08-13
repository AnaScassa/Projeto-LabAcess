import { useEffect, useState } from "react";
import { carregarApontamento } from "../services/apontamento";
import type { Apontamento } from "../types/Apontamento";

export function useApontamento(){
    const[apontamento, setApontamento] = useState<Apontamento[]>([]);

    useEffect(() => {
        async function load(){
            const data = await carregarApontamento();
            setApontamento(data);
        }

        load();
    }, []);

    return { apontamento };
}