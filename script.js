/* NikoClinik — validación y envío del formulario de citas */

(function () {
  'use strict';

  var form = document.getElementById('booking-form');
  var success = document.getElementById('form-success');
  var fecha = document.getElementById('fecha');

  // No permitir agendar en el pasado; por defecto, el día siguiente.
  var hoy = new Date();
  var manana = new Date(hoy.getTime() + 24 * 60 * 60 * 1000);
  fecha.min = toInputDate(hoy);
  fecha.value = toInputDate(manana);

  function toInputDate(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  var reglas = {
    nombre: function (v) {
      if (!v.trim()) return 'Escribe tu nombre.';
      if (v.trim().length < 3) return 'El nombre es demasiado corto.';
      return '';
    },
    telefono: function (v) {
      if (!v.trim()) return 'Necesitamos un teléfono para confirmar.';
      if (v.replace(/\D/g, '').length < 7) return 'Revisa el número de teléfono.';
      return '';
    },
    email: function (v) {
      if (!v.trim()) return ''; // opcional
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Ese correo no parece válido.';
      return '';
    },
    motivo: function (v) { return v ? '' : 'Elige el motivo de la consulta.'; },
    horario: function (v) { return v ? '' : 'Elige una franja horaria.'; },
    fecha: function (v) {
      if (!v) return 'Elige una fecha.';
      if (v < fecha.min) return 'Elige una fecha a partir de hoy.';
      var dia = new Date(v + 'T00:00:00').getDay();
      if (dia === 0) return 'Los domingos no atendemos. Elige otro día.';
      return '';
    }
  };

  function validarCampo(nombre) {
    var input = form.elements[nombre];
    var mensaje = reglas[nombre](input.value);
    var slot = form.querySelector('[data-error-for="' + nombre + '"]');
    if (slot) slot.textContent = mensaje;
    input.classList.toggle('is-invalid', Boolean(mensaje));
    return !mensaje;
  }

  // Limpia el error en cuanto el usuario corrige.
  Object.keys(reglas).forEach(function (nombre) {
    var input = form.elements[nombre];
    input.addEventListener('blur', function () { validarCampo(nombre); });
    input.addEventListener('input', function () {
      if (input.classList.contains('is-invalid')) validarCampo(nombre);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    success.hidden = true;

    var campos = Object.keys(reglas);
    var ok = campos.map(validarCampo).every(Boolean);

    if (!ok) {
      var primero = form.querySelector('.is-invalid');
      if (primero) primero.focus();
      return;
    }

    var datos = {
      nombre: form.elements.nombre.value.trim(),
      telefono: form.elements.telefono.value.trim(),
      email: form.elements.email.value.trim(),
      motivo: form.elements.motivo.value,
      fecha: form.elements.fecha.value,
      horario: form.elements.horario.value,
      nota: form.elements.nota.value.trim()
    };

    // TODO: conectar con el backend / servicio de agenda.
    // Ejemplo:
    // fetch('/api/citas', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(datos)
    // });
    console.log('Solicitud de cita:', datos);

    form.reset();
    fecha.value = toInputDate(manana);
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
