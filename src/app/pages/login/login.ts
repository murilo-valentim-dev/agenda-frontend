import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, RouterModule],
    templateUrl: './login.html',
    styleUrls: ['./login.css']
})
export class Login {
    username = '';
    password = '';

    constructor(private router: Router) { }

    login() {
        // Login fixo só pra exemplo
        if (this.username === 'user' && this.password === '123') {
            this.router.navigate(['/agenda']);
        } else {
            alert('Usuário ou senha inválidos');
        }
    }
}
