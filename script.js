import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'


const supabaseUrl = 'https://ubcwvjypbcvnyyfcmjvi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViY3d2anlwYmN2bnl5ZmNtanZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNDk4NjksImV4cCI6MjA2NTYyNTg2OX0.PXmnTCcN1Vu14SuMyCX-M3ZmqDbKVTYuqiLd5OR4qFo'
export const supabase = createClient(supabaseUrl, supabaseKey)

// Mostrar nombre de usuario y botón de logout
async function setupUserUI() {
  const { data: { user } } = await supabase.auth.getUser();
  const username = localStorage.getItem('username');
  
  // Mostrar nombre de usuario
  document.getElementById('navbar-username').textContent = `Hola, ${username}`;
  
  // Configurar botón de logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('authenticated');
      localStorage.removeItem('username');
      window.location.href = 'auth/login.html';
    } catch (error) {
      alert('Error al cerrar sesión: ' + error.message);
    }
  });
}
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'auth/login.html';
        return;
    }

    // Verificar sesión
   
    
    // Elementos del DOM
    const alimentoForm = document.getElementById('alimento-form');
    const selectAlimento = document.getElementById('select-alimento');
    const alimentosTable = document.getElementById('alimentos-table');
    const calcularBtn = document.getElementById('calcular-btn');
    const resultadosDiv = document.getElementById('resultados');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const formTitle = document.getElementById('form-title');
    const logoutBtn = document.createElement('button');
    
    // Variables de estado
    let editando = false;
    let alimentoEditId = null;
    

    // Inicializar la aplicación
    async function init() {
        await renderAlimentosSelect();
        await renderAlimentosTable();
        setupEventListeners();
    }
    // Obtener alimentos del usuario actual
async function loadAlimentos() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: alimentos, error } = await supabase
        .from('alimentos')
        .select('*')
        .eq('user_id', user.id); // RLS ya filtra automáticamente

    if (error) {
        console.error('Error cargando alimentos:', error);
        return [];
    }

    return alimentos;
}

// Añadir nuevo alimento
async function addAlimento(nombre, proteinas, carbohidratos, calorias) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
        .from('alimentos')
        .insert([
            { 
                user_id: user.id,
                nombre,
                proteinas,
                carbohidratos,
                calorias 
            }
        ]);

    if (error) throw error;
}
    
    // Configurar event listeners
    function setupEventListeners() {
        alimentoForm.addEventListener('submit', handleFormSubmit);
        calcularBtn.addEventListener('click', calcularMacros);
        cancelEditBtn.addEventListener('click', cancelarEdicion);
    }
    
    // Manejar el envío del formulario
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const nombre = document.getElementById('nombre').value;
        const proteinas = parseFloat(document.getElementById('proteinas').value);
        const carbohidratos = parseFloat(document.getElementById('carbohidratos').value);
        const calorias = parseFloat(document.getElementById('calorias').value);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Debes iniciar sesión para realizar esta acción.');
            window.location.href = 'auth/login.html';
            return;
        }
        
        try {
            if (editando) {
                // Actualizar alimento existente
                const { error } = await supabase
                    .from('alimentos')
                    .update({ nombre, proteinas, carbohidratos, calorias })
                    .eq('id', alimentoEditId);
                
                if (error) throw error;
            } else {
                // Agregar nuevo alimento
                const { error } = await supabase
                    .from('alimentos')
                    .insert([{ 
                        user_id: user.id, 
                        nombre, 
                        proteinas, 
                        carbohidratos, 
                        calorias 
                    }]);
                
                if (error) throw error;
            }
            
            resetForm();
            await renderAlimentosSelect();
            await renderAlimentosTable();
        } catch (error) {
            alert('Error al guardar el alimento: ' + error.message);
        }
    }
    
    // Calcular macros para la cantidad especificada
    async function calcularMacros() {
        const alimentoId = selectAlimento.value;
        const cantidad = parseFloat(document.getElementById('cantidad').value) || 100;
        
        if (!alimentoId) {
            alert('Por favor seleccione un alimento');
            return;
        }
        
        try {
            const { data: alimento, error } = await supabase
                .from('alimentos')
                .select('*')
                .eq('id', alimentoId)
                .single();
            
            if (error) throw error;
            
            const factor = cantidad / 100;
            
            document.getElementById('nombre-alimento').textContent = alimento.nombre;
            document.getElementById('cantidad-alimento').textContent = cantidad;
            document.getElementById('result-proteinas').textContent = (alimento.proteinas * factor).toFixed(1) + ' g';
            document.getElementById('result-carbohidratos').textContent = (alimento.carbohidratos * factor).toFixed(1) + ' g';
            document.getElementById('result-calorias').textContent = (alimento.calorias * factor).toFixed(1) + ' kcal';
            
            resultadosDiv.style.display = 'block';
        } catch (error) {
            alert('Error al calcular macros: ' + error.message);
        }
    }
    
    // Editar alimento
    function editarAlimento(id) {
        const alimentoRow = document.querySelector(`tr[data-id="${id}"]`);
        if (!alimentoRow) return;
        
        editando = true;
        alimentoEditId = id;
        formTitle.textContent = 'Editar Alimento';
        cancelEditBtn.style.display = 'inline-block';
        
        document.getElementById('nombre').value = alimentoRow.dataset.nombre;
        document.getElementById('proteinas').value = alimentoRow.dataset.proteinas;
        document.getElementById('carbohidratos').value = alimentoRow.dataset.carbohidratos;
        document.getElementById('calorias').value = alimentoRow.dataset.calorias;
        document.getElementById('alimento-id').value = id;
    }
    
    // Eliminar alimento
    async function eliminarAlimento(id) {
        if (!confirm('¿Está seguro de que desea eliminar este alimento?')) return;
        
        try {
            const { error } = await supabase
                .from('alimentos')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            await renderAlimentosSelect();
            await renderAlimentosTable();
        } catch (error) {
            alert('Error al eliminar alimento: ' + error.message);
        }
    }
    
    // Cancelar edición
    function cancelarEdicion() {
        editando = false;
        alimentoEditId = null;
        formTitle.textContent = 'Agregar Nuevo Alimento';
        cancelEditBtn.style.display = 'none';
        resetForm();
    }
    
    // Resetear formulario
    function resetForm() {
        alimentoForm.reset();
        document.getElementById('alimento-id').value = '';
    }
    
    // Renderizar select de alimentos
    async function renderAlimentosSelect() {
        const { data: { user } } = await supabase.auth.getUser();
        
        try {
            const { data: alimentos, error } = await supabase
                .from('alimentos')
                .select('*')
                .eq('user_id', user.id);
            
            if (error) throw error;
            
            selectAlimento.innerHTML = '<option value="">-- Seleccione un alimento --</option>';
            
            alimentos.forEach(alimento => {
                const option = document.createElement('option');
                option.value = alimento.id;
                option.textContent = alimento.nombre;
                selectAlimento.appendChild(option);
            });
        } catch (error) {
            alert('Error al cargar alimentos: ' + error.message);
        }
    }
    
    // Renderizar tabla de alimentos
    async function renderAlimentosTable() {
        const { data: { user } } = await supabase.auth.getUser();
        
        try {
            const { data: alimentos, error } = await supabase
                .from('alimentos')
                .select('*')
                .eq('user_id', user.id);
            
            if (error) throw error;
            
            alimentosTable.innerHTML = '';
            
            if (alimentos.length === 0) {
                alimentosTable.innerHTML = '<tr><td colspan="5" class="text-center">No hay alimentos registrados</td></tr>';
                return;
            }
            
            alimentos.forEach(alimento => {
                const tr = document.createElement('tr');
                tr.dataset.id = alimento.id;
                tr.dataset.nombre = alimento.nombre;
                tr.dataset.proteinas = alimento.proteinas;
                tr.dataset.carbohidratos = alimento.carbohidratos;
                tr.dataset.calorias = alimento.calorias;
                
                tr.innerHTML = `
                    <td>${alimento.nombre}</td>
                    <td>${alimento.proteinas}</td>
                    <td>${alimento.carbohidratos}</td>
                    <td>${alimento.calorias}</td>
                    <td>
                        <button onclick="editarAlimento('${alimento.id}')" class="btn btn-sm btn-warning">Editar</button>
                        <button onclick="eliminarAlimento('${alimento.id}')" class="btn btn-sm btn-danger">Eliminar</button>
                    </td>
                `;
                
                alimentosTable.appendChild(tr);
            });
        } catch (error) {
            alert('Error al cargar alimentos: ' + error.message);
        }
    }
    
    // Hacer funciones disponibles globalmente para los botones en la tabla
    window.editarAlimento = editarAlimento;
    window.eliminarAlimento = eliminarAlimento;
    
    // Inicializar la aplicación
    init();
    setupUserUI();
    
});