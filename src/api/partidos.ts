/**
 * Matches Service — API Client
 *
 * Endpoints del Matches Service expuestos via APIM:
 *   GET /api/partidos            → listado de partidos
 *   GET /api/partidos/{matchId}  → detalle de un partido
 *   POST /api/partidos           → crear un nuevo partido
 */

import { apiGet, apiPost } from './client'
import type { MatchSummaryAPI, MatchDetailAPI, CreateMatchRequest, CreateMatchResponse } from './tipos'

// Siempre via APIM — el client.ts ya apunta a https://techapi.azure-api.net
// Endpoint real en APIM: api/v1/Partidos
const MATCHES_PATH = '/api/v1/Partidos'

/**
 * Obtiene todos los partidos via APIM.
 * GET /api/v1/matches
 */
export async function getPartidosApi(): Promise<MatchSummaryAPI[]> {
  return apiGet<MatchSummaryAPI[]>(`${MATCHES_PATH}`)
}

/**
 * Obtiene detalle de un partido por ID via APIM.
 * GET /api/v1/matches/{matchId}
 */
export async function getPartidoPorIdApi(
  matchId: string
): Promise<MatchDetailAPI> {
  return apiGet<MatchDetailAPI>(`${MATCHES_PATH}/${matchId}`)
}

/**
 * Crea un nuevo partido via APIM.
 * POST /api/v1/matches
 */
export async function crearPartidoApi(
  data: CreateMatchRequest
): Promise<CreateMatchResponse> {
  return apiPost<CreateMatchResponse>(`${MATCHES_PATH}`, {
    tournamentId: data.tournamentId,
    homeTeamName: data.homeTeamId === 'eq-1' ? 'Tigres FC' : data.homeTeamId === 'eq-2' ? 'Sistemas FC' : data.homeTeamId === 'eq-3' ? 'Code United' : data.homeTeamId === 'eq-4' ? 'IA Warriors' : data.homeTeamId === 'eq-5' ? 'Dragones FC' : data.homeTeamId === 'eq-6' ? 'Los Bits' : 'Equipo',
    awayTeamName: data.awayTeamId === 'eq-1' ? 'Tigres FC' : data.awayTeamId === 'eq-2' ? 'Sistemas FC' : data.awayTeamId === 'eq-3' ? 'Code United' : data.awayTeamId === 'eq-4' ? 'IA Warriors' : data.awayTeamId === 'eq-5' ? 'Dragones FC' : data.awayTeamId === 'eq-6' ? 'Los Bits' : 'Equipo',
    scheduledDate: data.scheduledDate,
    venue: data.venue,
  })
}
