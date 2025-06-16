import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Aluguel, AluguelService } from '../../services/aluguel';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CpfMaskPipe } from '../../pipes/cpf-mask.pipe';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventInput } from '@fullcalendar/core';

@Component({
    selector: 'app-agenda',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NgxMaskDirective,
        CpfMaskPipe,
        FullCalendarModule
    ],
    providers: [provideNgxMask()],
    templateUrl: './agenda.html',
    styleUrls: ['./agenda.css']
})
export class Agenda {
    selectedDate: string | null = null;
    rentals: Aluguel[] = [];

    name = '';
    cpf = '';
    value: number | null = null;

    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        plugins: [dayGridPlugin, interactionPlugin],
        events: [],
        dateClick: this.onDateClick.bind(this),
        locale: 'pt-br',
        eventContent: this.customEventContent.bind(this) // ícone no evento
    };

    constructor(private aluguelService: AluguelService) {
        this.loadAllRentals(); // carrega todos os eventos ao iniciar
    }

    onDateClick(arg: { dateStr: string }) {
        this.selectedDate = arg.dateStr;
        this.name = '';
        this.cpf = '';
        this.value = null;
        this.loadRentals(this.selectedDate);
    }

    selectDate(event: Event) {
        const input = event.target as HTMLInputElement;
        this.selectedDate = input.value;
        this.name = '';
        this.value = null;
        this.cpf = '';
        if (this.selectedDate) {
            this.loadRentals(this.selectedDate);
        }
    }

    // 🔄 Carrega os aluguéis do dia selecionado
    loadRentals(date: string) {
        this.aluguelService.listarPorData(date).subscribe({
            next: (data: Aluguel[]) => {
                this.rentals = data;
            },
            error: (err: any) => console.error('Erro ao carregar aluguéis', err)
        });
    }

    // 🔄 Carrega todos os aluguéis para exibir no calendário
    loadAllRentals() {
        this.aluguelService.listarTodos().subscribe({
            next: (data: Aluguel[]) => {
                this.calendarOptions.events = data.map((aluguel: Aluguel): EventInput => ({
                    title: aluguel.nome,
                    date: aluguel.data,
                    backgroundColor: '#f87171', // vermelho claro
                    borderColor: '#dc2626',
                    textColor: '#fff'
                }));
            },
            error: (err: any) => console.error('Erro ao carregar eventos do calendário', err)
        });
    }

    // 🏠 Exibe ícone no evento do calendário
    customEventContent(eventInfo: any) {
        const icon = document.createElement('span');
        icon.innerText = '🏠';
        icon.style.marginRight = '4px';

        const name = document.createElement('span');
        name.innerText = eventInfo.event.title;

        const fragment = document.createDocumentFragment();
        fragment.appendChild(icon);
        fragment.appendChild(name);

        return { domNodes: [fragment] };
    }

    addRental() {
        if (!this.selectedDate || !this.name || !this.cpf || this.value === null) {
            alert('Preencha todos os campos');
            return;
        }

        const novoAluguel: Aluguel = {
            data: this.selectedDate,
            nome: this.name,
            cpf: this.cpf,
            valor: this.value
        };

        this.aluguelService.adicionar(novoAluguel).subscribe({
            next: () => {
                this.loadRentals(this.selectedDate!);
                this.loadAllRentals(); // atualiza eventos do calendário
                this.name = '';
                this.value = null;
                this.cpf = '';
            },
            error: (err: any) => console.error('Erro ao adicionar aluguel', err)
        });
    }

    getRentalsForDate(date: string): Aluguel[] {
        return this.rentals.filter((r: Aluguel) => r.data.startsWith(date));
    }

    editando: boolean = false;
    aluguelEditando: Aluguel | null = null;

    editarRental(aluguel: Aluguel) {
        this.editando = true;
        this.aluguelEditando = { ...aluguel };
        this.name = aluguel.nome;
        this.cpf = aluguel.cpf;
        this.value = aluguel.valor;
        this.selectedDate = aluguel.data;
    }

    atualizarRental() {
        if (!this.aluguelEditando) return;

        const aluguelAtualizado: Aluguel = {
            ...this.aluguelEditando,
            nome: this.name,
            cpf: this.cpf,
            valor: this.value!
        };

        this.aluguelService.atualizar(aluguelAtualizado).subscribe({
            next: () => {
                this.loadRentals(this.selectedDate!);
                this.loadAllRentals(); // atualiza calendário
                this.cancelarEdicao();
            },
            error: (err) => console.error('Erro ao atualizar aluguel', err)
        });
    }

    cancelarEdicao() {
        this.editando = false;
        this.aluguelEditando = null;
        this.name = '';
        this.cpf = '';
        this.value = null;
    }

    excluirRental(aluguel: Aluguel) {
        if (confirm('Tem certeza que deseja excluir este aluguel?')) {
            this.aluguelService.excluir(aluguel.id!).subscribe({
                next: () => {
                    this.loadRentals(this.selectedDate!);
                    this.loadAllRentals(); // atualiza calendário
                },
                error: (err) => console.error('Erro ao excluir aluguel', err)
            });
        }
    }
}
