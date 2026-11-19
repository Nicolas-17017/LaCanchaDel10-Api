const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function aISO(fecha: Date): string {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

export function desdeISO(iso: string): Date {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function proximosDias(cantidad: number): { iso: string; dia: string; numero: string }[] {
  const lista = [];
  for (let i = 0; i < cantidad; i++) {
    const f = new Date();
    f.setDate(f.getDate() + i);
    lista.push({ iso: aISO(f), dia: i === 0 ? 'hoy' : DIAS[f.getDay()], numero: String(f.getDate()) });
  }
  return lista;
}

export function fechaLarga(iso: string): string {
  const f = desdeISO(iso);
  return `${DIAS[f.getDay()]} ${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()}`;
}

export function hora(texto: string): string {
  return texto.slice(0, 5);
}

export function dinero(valor: number): string {
  return `$${Number(valor).toLocaleString('es-CO')}`;
}