import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Aluguel, AluguelService } from '../../services/aluguel';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CpfMaskPipe } from '../../pipes/cpf-mask.pipe';

import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';

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
    @ViewChild(FullCalendarComponent) calendarComponent!: FullCalendarComponent;

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
        eventDisplay: 'block'
    };

    constructor(private aluguelService: AluguelService) { }

    ngAfterViewInit() {
        this.loadAllRentals();
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

    loadRentals(date: string) {
        this.aluguelService.listarPorData(date).subscribe({
            next: (data) => this.rentals = data,
            error: (err) => console.error('Erro ao carregar aluguéis', err)
        });
    }

    loadAllRentals() {
        this.aluguelService.listarTodos().subscribe({
            next: (data) => {
                const calendarApi = this.calendarComponent.getApi();
                calendarApi.removeAllEvents();

                const datasUnicas = new Set<string>();

                data.forEach((aluguel) => {
                    // Converte a data UTC para objeto Date local
                    const dataLocal = new Date(aluguel.data);
                    // Extrai a parte da data no formato 'YYYY-MM-DD' para o fuso local
                    const dataFormatada = dataLocal.toISOString().split('T')[0];

                    datasUnicas.add(dataFormatada);
                });

                datasUnicas.forEach((data) => {
                    // Evento de fundo para destacar o dia
                    calendarApi.addEvent({
                        start: data,
                        display: 'background',
                        backgroundColor: '#f87171'
                    });

                    // Evento visível com o ícone
                    calendarApi.addEvent({
                        title: '🏠',
                        date: data,
                        backgroundColor: '#f87171',
                        borderColor: '#dc2626',
                        textColor: '#fff'
                    });
                });
            },
            error: (err) => console.error('Erro ao carregar eventos', err)
        });
    }

    addRental() {
        if (!this.selectedDate || !this.name || !this.cpf || this.value === null) {
            alert('Preencha todos os campos');
            return;
        }

        // Cria a data UTC no início do dia selecionado
        const dataUtc = new Date(this.selectedDate + 'T00:00:00').toISOString();

        const novoAluguel: Aluguel = {
            data: dataUtc,
            nome: this.name,
            cpf: this.cpf,
            valor: this.value
        };

        this.aluguelService.adicionar(novoAluguel).subscribe({
            next: () => {
                this.loadRentals(this.selectedDate!);
                this.loadAllRentals();
                this.name = '';
                this.value = null;
                this.cpf = '';
            },
            error: (err) => console.error('Erro ao adicionar aluguel', err)
        });
    }

    getRentalsForDate(date: string): Aluguel[] {
        return this.rentals.filter((r) => r.data.startsWith(date));
    }

    editando = false;
    aluguelEditando: Aluguel | null = null;

    editarRental(aluguel: Aluguel) {
        this.editando = true;
        this.aluguelEditando = { ...aluguel };
        this.name = aluguel.nome;
        this.cpf = aluguel.cpf;
        this.value = aluguel.valor;

        // Converte a data UTC para string YYYY-MM-DD local para exibir no input
        const dataLocal = new Date(aluguel.data);
        this.selectedDate = dataLocal.toISOString().split('T')[0];
    }

    atualizarRental() {
        if (!this.aluguelEditando) return;

        // Data UTC no início do dia selecionado
        const dataUtc = new Date(this.selectedDate + 'T00:00:00').toISOString();

        const aluguelAtualizado: Aluguel = {
            ...this.aluguelEditando,
            nome: this.name,
            cpf: this.cpf,
            valor: this.value!,
            data: dataUtc
        };

        this.aluguelService.atualizar(aluguelAtualizado).subscribe({
            next: () => {
                this.loadRentals(this.selectedDate!);
                this.loadAllRentals();
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
                    this.loadAllRentals();
                },
                error: (err) => console.error('Erro ao excluir aluguel', err)
            });
        }
    }
}
