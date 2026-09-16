import { useEffect, useRef, useState } from 'react';

export default function useAutoSaveTexto(guardar, valorServidor) {
  const [valor, setValor] = useState(valorServidor || '');
  const [estadoGuardado, setEstadoGuardado] = useState('inactivo');
  const timeoutRef = useRef(null);
  const ultimoGuardadoRef = useRef(valorServidor || '');

  useEffect(() => {
    setValor(valorServidor || '');
    ultimoGuardadoRef.current = valorServidor || '';
  }, [valorServidor]);

  function onChange(nuevoValor) {
    setValor(nuevoValor);
    setEstadoGuardado('escribiendo');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      if (nuevoValor === ultimoGuardadoRef.current) return;
      setEstadoGuardado('guardando');
      await guardar(nuevoValor);
      ultimoGuardadoRef.current = nuevoValor;
      setEstadoGuardado('guardado');
    }, 900);
  }

  return { valor, onChange, estadoGuardado };
}
