import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface Aluguel {
  id?: number;
  data: string;
  nome: string;
  cpf: string;
  valor: number;
}

@Injectable({
  providedIn: 'root'
})
export class AluguelService {

  private apiUrl = `${environment.apiUrl}/api/aluguel`;


  constructor(private http: HttpClient) { }

  // Lista aluguéis por data específica
  listarPorData(data: string): Observable<Aluguel[]> {
    return this.http.get<Aluguel[]>(`${this.apiUrl}/por-data/${data}`);
  }

  // Lista todos os aluguéis
  listarTodos(): Observable<Aluguel[]> {
    return this.http.get<Aluguel[]>(this.apiUrl);
  }

  // Adiciona um novo aluguel
  adicionar(aluguel: Aluguel): Observable<Aluguel> {
    return this.http.post<Aluguel>(this.apiUrl, aluguel);
  }

  // Atualiza um aluguel existente
  atualizar(aluguel: Aluguel): Observable<Aluguel> {
    if (!aluguel.id) {
      throw new Error('ID do aluguel é obrigatório para atualização.');
    }
    return this.http.put<Aluguel>(`${this.apiUrl}/${aluguel.id}`, aluguel);
  }

  // Exclui um aluguel pelo ID
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
