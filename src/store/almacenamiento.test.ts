import { afterEach, describe, expect, it, vi } from 'vitest';
import { almacenamientoSeguro } from './almacenamiento';

describe('almacenamientoSeguro', () => {
  afterEach(() => vi.restoreAllMocks());

  it('lee y escribe en localStorage', () => {
    almacenamientoSeguro.setItem('k', 'v');
    expect(almacenamientoSeguro.getItem('k')).toBe('v');
    almacenamientoSeguro.removeItem('k');
    expect(almacenamientoSeguro.getItem('k')).toBeNull();
  });

  it('no lanza si localStorage falla (modo privado, cuota llena)', () => {
    const error = () => {
      throw new Error('SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(error);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(error);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(error);

    expect(() => almacenamientoSeguro.setItem('k', 'v')).not.toThrow();
    expect(almacenamientoSeguro.getItem('k')).toBeNull();
    expect(() => almacenamientoSeguro.removeItem('k')).not.toThrow();
  });
});
