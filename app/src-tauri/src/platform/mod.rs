//! Camada de plataforma. O engine nunca toca o SO diretamente — passa por aqui.
//! Implementação real no Windows; stubs nas demais plataformas (para dev de UI).

#[cfg(windows)]
mod win;
#[cfg(windows)]
pub use win::*;

#[cfg(not(windows))]
mod other;
#[cfg(not(windows))]
pub use other::*;
