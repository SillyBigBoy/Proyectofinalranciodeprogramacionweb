import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://fktmxoovyfmwdxekqebs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrdG14b292eWZtd2R4ZWtxZWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NTUyNDAsImV4cCI6MjA2NDMzMTI0MH0.00eXkyrej32Ft95fcgXnAK9r4DX9tTjpe8BWZDmi8G0'
export const supabase = createClient(supabaseUrl, supabaseKey)

// Manejar registro
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(username)) {
        alert('El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: `${username}@macrosapp.com`, // Usamos un email ficticio
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });
        
        if (error) throw error;
        
        alert('Registro exitoso! Por favor inicia sesión');
        window.location.href = 'login.html';
    } catch (error) {
        alert('Error en el registro: ' + JSON.stringify(error));
    }
});

// Manejar login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: `${username}@macrosapp.com`, // Usamos el mismo email ficticio
            password: password
        });
        
        if (error) throw error;
        
        // Guardar sesión y redirigir
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('username', username);
        window.location.href = '../index.html';
    } catch (error) {
        alert('Error en el login: ' + error.message);
    }
});

// Verificar autenticación al cargar la app
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html')) {
        const isAuthenticated = localStorage.getItem('authenticated');
        if (!isAuthenticated) {
            window.location.href = 'auth/login.html';
        }
    }
});