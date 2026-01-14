/**
 * LÓGICA DE PROGRAMACIÓN (GitHub)
 */
const API_URL = "https://script.google.com/macros/s/AKfycbzXHrhmpQabBjJAY-mGInniz9Hinuspvhf2jLh1ujZR0sp9eDZQWaF7CJWS2VtN-9JQ/exec"; // REEMPLAZAR CON TU URL DE GOOGLE
let sessionEmail = "";
let sessionName = "";

// 1. LOGIN Y SEGURIDAD
function login() {
    const email = document.getElementById('email-input').value.toLowerCase().trim();
    // Validación estricta según registro
    if (email.endsWith('@osde.com.ar') || email === 'rodri@gmx.com') {
        sessionEmail = email;
        sessionName = email.split('@')[0].toUpperCase();
        
        document.getElementById('view-login').classList.add('hidden');
        document.getElementById('view-main').classList.remove('hidden');
        document.getElementById('welcome-msg').innerText = `Hola, ${sessionName}`;
        
        consultarPlanilla(); // Cargar auditoría al entrar
    } else {
        alert("Solo emails @osde.com.ar permitidos.");
    }
}

// 2. CARGA A GOOGLE SHEETS
async function enviar() {
    const tk = document.getElementById('tk-input').value;
    const hs = document.getElementById('hs-input').value;
    const mes = document.getElementById('mes-input').value;

    if(!tk || !hs) return alert("Completa los datos");

    const datos = {
        type: "carga",
        n: sessionName,
        u: sessionEmail,
        mes: mes,
        tk: tk,
        h: hs,
        p: "100%"
    };

    await fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(datos) });
    alert("Cargado correctamente");
    location.reload();
}

// 3. LEER PLANILLA Y GENERAR BADGES
async function consultarPlanilla() {
    try {
        const res = await fetch(API_URL);
        const filas = await res.json();
        
        document.getElementById('view-audit').classList.remove('hidden');
        dibujarAuditoria(filas);
    } catch (e) { console.error("Error leyendo datos"); }
}

function dibujarAuditoria(filas) {
    const lista = document.getElementById('lista');
    const badgeArea = document.getElementById('badges');
    lista.innerHTML = "";
    badgeArea.innerHTML = "";

    let sumas = {}; // Para el Badge Azul

    filas.forEach(f => {
        if (f[0] === "DATA") {
            const [label, nombre, email, mes, fecha, tk, horas] = f;

            // Acumular horas para el Badge
            const key = `${nombre} (${mes})`;
            sumas[key] = (sumas[key] || 0) + parseFloat(horas);

            // Crear fila de auditoría
            const div = document.createElement('div');
            div.className = "item-auditoria";
            div.innerHTML = `
                <div>
                    <strong>${nombre}</strong>
                    <small>${email}</small>
                    <span>📅 ${new Date(fecha).toLocaleDateString()} | 🎟️ TK: ${tk} | ⏱️ ${horas}hs</span>
                </div>
                <button class="btn-del" onclick="borrarRegistro('${email}', '${fecha}', '${horas}')">🗑️</button>
            `;
            lista.appendChild(div);
        }
    });

    // Crear Badges Azules automáticos
    for (const [txt, total] of Object.entries(sumas)) {
        const b = document.createElement('div');
        b.className = "badge";
        b.innerText = `🔵 ${txt}: ${total}hs Totales`;
        badgeArea.appendChild(b);
    }
}

// 4. BORRAR REGISTRO
async function borrarRegistro(email, fecha, horas) {
    if(!confirm("¿Borrar este registro?")) return;
    
    const datos = { type: "borrar_registro", u: email, f: fecha, h: horas };
    await fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(datos) });
    
    alert("Eliminado");
    location.reload();
}
