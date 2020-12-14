var jQuery = require('jquery');
var popper = require('popper.js');
var bootstrap = require('bootstrap');

/**
 * The CapsAttachment is the controller for a span.pdf-attachment element, and
 * handles the asynchronous loading of cryptographics signatures.
 */
class CapsAttachment {
  constructor(el) {
    this.el = el;
    this.id = el.getAttribute('data-id');
    this.signature_url = el.getAttribute('data-signature-url');

    this.loadSignatures();
  }

  formatDate(d) {
    return new Date(d).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  createTooltip(sig) {
    var sigdate = this.formatDate(sig.date);
    var signotafter = this.formatDate(sig.notAfter);

    return `
      <div class='text-left'>
        <strong>Nome:</strong> ${sig.name}<br>
        <strong>Data firma:</strong> ${sigdate}<br>
        <strong>Firma valida fino a:</strong> ${signotafter}<br>
        <br>
        <small><strong>Entità firmataria:</strong> ${sig.DN}</small><br>
        <small><strong>Entità che rilascia la firma:</strong> ${sig.issuerDN}</small>
      </div>
    `;
  }

  loadSignatures() {
    var self = this;

    jQuery.getJSON(this.signature_url, function (data) {
      var signatures = data['signatures'];
      for (var i = 0; i < signatures.length; i++) {
        var sig = signatures[i];
        if (sig.valid) {
          var tooltip = self.createTooltip(sig);

          var signature_elem = document.createElement('span');
          signature_elem.setAttribute('class',
            'badge badge-sm badge-success ml-2 px-2');
          signature_elem.setAttribute('data-toggle', 'tooltip');

          signature_elem.innerHTML =
            `<i class="fas fa-pen-fancy mr-1"></i>${sig.name}`;

          jQuery(self.el).append(signature_elem);
          jQuery(signature_elem).popover({
            html: true,
            container: 'body',
            title: 'Dettagli sulla firma',
            content: self.createTooltip(sig),
            trigger: 'hover'
          });
        }
      }
    })
  }

}

jQuery(document).ready(function() {
  jQuery('.pdf-attachment').each(function (idx, el) {
    new CapsAttachment(el);
  })
});
