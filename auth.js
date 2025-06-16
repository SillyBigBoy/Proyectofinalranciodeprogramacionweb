import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'


const supabaseUrl = 'https://ubcwvjypbcvnyyfcmjvi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViY3d2anlwYmN2bnl5ZmNtanZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDk4NjksImV4cCI6MjA2NTYyNTg2OX0.PXmnTCcN1Vu14SuMyCX-M3ZmqDbKVTYuqiLd5OR4qFo'
export const supabase = createClient(supabaseUrl, supabaseKey)

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Validación de username
            const usernameRegex = /^[a-zA-Z0-9._-]+$/;
            if (!usernameRegex.test(username)) {
                alert('El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos.');
                return;
            }

            // Validación de contraseñas
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            try {
                const { data, error } = await supabase.auth.signUp({
                    email: `${username}@macrosapp.com`, // Email ficticio
                    password: password,
                    options: {
                        data: {
                            username: username
                        }
                    }
                });

                if (error && error.code === '23505') {
                    alert('El nombre de usuario ya está en uso. Por favor elige otro.');
                } else if (error) {
                    alert('Error en el registro: ' + error.message);
                } else {
                    alert('Registro exitoso. Ahora puedes iniciar sesión.');
                    window.location.href = 'login.html';
                }
            } catch (error) {
                alert('Error en el registro: ' + JSON.stringify(error));
            }
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: `${username}@macrosapp.com`,
                    password: password
                });

                if (error) {
                    alert('Error al iniciar sesión: ' + error.message);
                    return;
                }

                // Si login exitoso
                localStorage.setItem('username', username);
                window.location.href = '../index.html';
            } catch (error) {
                alert('Error inesperado: ' + JSON.stringify(error));
            }
        });
    }

  
    // ...tu código para usuarios autenticados...
});