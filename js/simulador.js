var ESCENARIOS = {
  'fuera-horario': {
    explicacion: {
      titulo: 'Flujo: auto-respuesta fuera de horario',
      texto: 'Un cliente escribe fuera del horario de atención. El workflow de n8n (workflows/auto-respuesta-fuera-horario.json) detecta la hora automáticamente y responde solo, incluyendo el link al menú, sin que nadie del local tenga que estar mirando el celular.'
    },
    mensajes: [
      { tipo: 'in', texto: 'Hola! quiero pedir 2 muzzarellas para las 21', hora: '02:14' },
      { tipo: 'out', tag: 'Automático', texto: '¡Hola! Gracias por escribir a Pizzería Don Mario 🍕\n\nEn este momento estamos cerrados. Nuestro horario es martes a domingos de 19 a 00hs (viernes y sábados hasta la 1am).\n\nTe dejamos el menú para que vayas eligiendo: ioconsultingarg.github.io/menu-qr-demo\n\nApenas abramos te respondemos para confirmar tu pedido 🙌', hora: '02:14' }
    ]
  },
  'turno': {
    explicacion: {
      titulo: 'Flujo: confirmación y recordatorio de reserva',
      texto: 'Al agendar una mesa, un webhook dispara la confirmación inmediata (workflows/confirmacion-y-recordatorio-turno.json). Un segundo disparador programado revisa cada hora las reservas próximas y manda el recordatorio 24hs antes, para bajar el ausentismo.'
    },
    mensajes: [
      { tipo: 'out', tag: 'Automático · al agendar', texto: '¡Hola Marina! Confirmamos tu reserva en Pizzería Don Mario 🍕\n\n📅 Viernes 4/9 a las 21:00\n👥 4 personas\n\nSi necesitás cambiar el horario, respondé este mensaje. ¡Te esperamos!', hora: 'Mar 18:30' },
      { tipo: 'out', tag: 'Automático · 24hs antes', texto: '¡Hola Marina! Te recordamos tu reserva mañana Viernes 4/9 a las 21:00 en Pizzería Don Mario 🍕\n\nSi no podés venir, respondé este mensaje para cancelar o reprogramar. ¡Te esperamos!', hora: 'Jue 21:00' },
      { tipo: 'in', texto: 'Perfecto, ahí estamos!', hora: 'Jue 21:04' }
    ]
  }
};

document.addEventListener('DOMContentLoaded', function () {
  var tabs = document.querySelectorAll('.scenario-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      renderScenario(tab.dataset.scenario);
    });
  });
  renderScenario('fuera-horario');

  function renderScenario(key) {
    var data = ESCENARIOS[key];
    var chatBody = document.getElementById('chatBody');
    chatBody.innerHTML = '';

    data.mensajes.forEach(function (msg, i) {
      setTimeout(function () {
        var bubble = document.createElement('div');
        bubble.className = 'bubble ' + msg.tipo;
        bubble.innerHTML =
          (msg.tag ? '<span class="bubble-tag">' + msg.tag + '</span><br>' : '') +
          escapeHtml(msg.texto) +
          '<span class="bubble-time">' + msg.hora + '</span>';
        chatBody.appendChild(bubble);
        chatBody.scrollTop = chatBody.scrollHeight;
      }, i * 450);
    });

    var explainer = document.getElementById('explainer');
    explainer.innerHTML = '<h2>' + data.explicacion.titulo + '</h2><p>' + data.explicacion.texto + '</p>';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
