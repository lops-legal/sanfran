import type { DadosFeriados } from "./prazo";
import dados from "../../../content/skills/feriados-forenses/dados/feriados.json";

/** Base de feriados forenses (fonte: content/skills/feriados-forenses/dados/feriados.json). */
export const FERIADOS = dados as unknown as DadosFeriados;
