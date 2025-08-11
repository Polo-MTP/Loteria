export interface CrearPartidaRequest {
  nombre: string;
  max_jugadores: number;
}

export interface CrearPartidaResponse {
  message: string;
  partida: Partida;
}

export interface Partida {
  id: number;
  nombre: string;
  anfitrionId: number;
  maxJugadores: number;
  estado: string;
  cartaActual: any;
  cartasGritadas: any[];
  createdAt: string;
  updatedAt: string;
}

export interface PartidaAnfitrionResponse {
  message: string;
  partida: PartidaAnfitrion;
}

export interface PartidaAnfitrion {
  id: number;
  nombre: string;
  anfitrionId: number;
  ganadorId: any;
  estado: string;
  maxJugadores: number;
  cartaActual: any;
  cartasGritadas: any[];
  createdAt: string;
  updatedAt: string;
  anfitrion: Anfitrion;
  usuarios: Usuario[];
}

export interface Anfitrion {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface EstadoPartidaResponse {
  message: string;
  estado: string;
  jugadores_actuales: number;
  max_jugadores: number;
}

export interface GritarCartaResponse {
  message: string;
  carta: number;
  partida: Partida;
}

export interface ResponseListaPartidas {
  message: string;
  partidas: PartidaAnfitrion[];
}

export interface unirsePartidaResponse {
  message: string;
  partida: PartidaUnirse;
}

export interface PartidaUnirse {
  id: number;
  nombre: string;
  anfitrionId: number;
  ganadorId: any;
  estado: string;
  maxJugadores: number;
  cartaActual: any;
  cartasGritadas: any[];
  createdAt: string;
  updatedAt: string;
  anfitrion: Anfitrion;
  usuarios: UsuarioFichas[];
}

export interface UsuarioFichas {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  cartas: number[];
  fichas: any[];
}

export interface Usuario {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface cartaResponse {
  cartas: number[];
  posiciones: number[];
}

export interface colocarFichaResponse {
  message: string;
  fichas: number[];
}

export interface colocarFichaRequest {
  posicion: number;
}

export interface ValidarCartaResponse {
  ganador: boolean;
  message: string;
}


export interface ObtenerPartidasResponse {
  message: string
  partidas: Partida[]
}


export interface ultimosDatosResponse {
  success: boolean
  yaHayGanador: boolean
  ganadorId: number
  tuEresElGanador: boolean
  ultimaCarta: number
}

export interface salirPartidaResponse {
  message: string;
  abandonoVoluntario?: boolean;
}

