import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'cpfMask',
    standalone: true
})
export class CpfMaskPipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return '';

        // Remove qualquer caractere que não seja número
        const digits = value.replace(/\D/g, '');

        // Aplica a máscara: 000.000.000-00
        if (digits.length !== 11) return value; // CPF tem 11 dígitos

        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}
