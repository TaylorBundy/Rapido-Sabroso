"use strict";

const API_BASE = window.API_BASE || "https://rapido-sabroso.onrender.com";

const loginSection = document.getElementById("loginSection");
const editorSection = document.getElementById("editorSection");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const listaProductos = document.getElementById("listaProductos");
const buscarProducto = document.getElementById("buscarProducto");
const filtroTipo = document.getElementById("filtroTipo");

const btnCerrarSesion = document.getElementById("btnCerrarSesion");

let productos = [];
let precios = {};
let descripciones = {};

let token = sessionStorage.getItem("editor_token");

/* =====================================================
   INICIO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (token) {
    mostrarEditor();
    cargarDatos();
  }
});

/* =====================================================
   LOGIN
===================================================== */

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginError.textContent = "";

  const usuario = document.getElementById("usuario").value.trim();

  const password = document.getElementById("password").value;

  try {
    const respuesta = await fetch(`${API_BASE}/api/editor/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        usuario,
        password,
      }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.error || "Usuario o contraseña incorrectos");
    }

    token = datos.token;

    sessionStorage.setItem("editor_token", token);

    mostrarEditor();

    cargarDatos();
  } catch (error) {
    console.error(error);

    loginError.textContent = error.message || "No se pudo iniciar sesión";
  }
});

/* =====================================================
   MOSTRAR EDITOR
===================================================== */

function mostrarEditor() {
  loginSection.classList.add("oculto");

  editorSection.classList.remove("oculto");
}

/* =====================================================
   CARGAR DATOS
===================================================== */

async function cargarDatos() {
  try {
    const [productosRes, preciosRes, descripcionesRes] = await Promise.all([
      fetch("assets/productos.json"),

      fetch("assets/precios.json"),

      fetch("assets/descripciones.json"),
    ]);

    const productosData = await productosRes.json();

    const preciosData = await preciosRes.json();

    const descripcionesData = await descripcionesRes.json();

    productos = productosData.productos || [];

    precios = preciosData.precios || {};

    descripciones = descripcionesData.descripciones || {};

    mostrarProductos();
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

/* =====================================================
   MOSTRAR PRODUCTOS
===================================================== */

function mostrarProductos() {
  const texto = buscarProducto.value.trim().toLowerCase();

  const tipo = filtroTipo.value;

  listaProductos.innerHTML = "";

  const filtrados = productos.filter((producto) => {
    const coincideTexto =
      !texto || producto.titulo.toLowerCase().includes(texto);

    const coincideTipo = tipo === "todos" || producto.tipo === tipo;

    return coincideTexto && coincideTipo;
  });

  if (filtrados.length === 0) {
    listaProductos.innerHTML = `
            <div class="sin-productos">
                No se encontraron productos.
            </div>
        `;

    return;
  }

  filtrados.forEach((producto) => {
    crearEditorProducto(producto);
  });
}

/* =====================================================
   CREAR EDITOR DE PRODUCTO
===================================================== */

function crearEditorProducto(producto) {
  const card = document.createElement("article");

  card.className = "producto-editor";

  const precioId = producto.precio_id || producto.id.toLowerCase();

  const precio = precios[precioId] || "";

  const descripcion =
    descripciones[producto.id.toLowerCase()] || producto.descripcion || "";

  card.innerHTML = `

        <div class="producto-titulo">

            <h2>
                ${producto.titulo}
            </h2>

            <span class="producto-tipo">
                ${producto.tipo}
            </span>

        </div>


        <div class="campo">

            <label>
                Título
            </label>

            <input
                type="text"
                class="input-titulo"
                value="${escapeHTML(producto.titulo)}"
            >

        </div>


        <div class="campo">

            <label>
                Precio
            </label>

            <input
                type="number"
                class="input-precio"
                value="${precio}"
                min="0"
            >

        </div>


        <div class="campo">

            <label>
                Descripción
            </label>

            <textarea
                class="input-descripcion"
                rows="4"
            >${escapeHTML(descripcion)}</textarea>

        </div>


        <div class="acciones">

            <button
                class="btn-guardar"
                data-id="${producto.id}"
            >
                Guardar cambios
            </button>

        </div>

    `;

  const btnGuardar = card.querySelector(".btn-guardar");

  btnGuardar.addEventListener("click", () => guardarProducto(producto, card));

  listaProductos.appendChild(card);
}

/* =====================================================
   GUARDAR PRODUCTO
===================================================== */

async function guardarProducto(producto, card) {
  const titulo = card.querySelector(".input-titulo").value.trim();

  const precio = card.querySelector(".input-precio").value.trim();

  const descripcion = card.querySelector(".input-descripcion").value.trim();

  const boton = card.querySelector(".btn-guardar");

  boton.disabled = true;

  boton.textContent = "Guardando...";

  try {
    const respuesta = await fetch(
      `${API_BASE}/api/editor/productos/${encodeURIComponent(producto.id)}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          titulo,
          precio,
          descripcion,
        }),
      },
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(datos.error || "No se pudieron guardar los cambios");
    }

    boton.textContent = "✓ Guardado";

    setTimeout(() => {
      boton.textContent = "Guardar cambios";
    }, 2000);
  } catch (error) {
    console.error(error);

    alert(error.message);

    boton.textContent = "Guardar cambios";
  }

  boton.disabled = false;
}

/* =====================================================
   BUSCADOR
===================================================== */

buscarProducto.addEventListener("input", mostrarProductos);

filtroTipo.addEventListener("change", mostrarProductos);

/* =====================================================
   CERRAR SESIÓN
===================================================== */

btnCerrarSesion.addEventListener("click", () => {
  sessionStorage.removeItem("editor_token");

  token = null;

  editorSection.classList.add("oculto");

  loginSection.classList.remove("oculto");

  loginForm.reset();
});

/* =====================================================
   SEGURIDAD HTML
===================================================== */

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
