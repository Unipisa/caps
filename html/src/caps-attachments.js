jQuery = require('jquery');


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

  loadSignatures() {
    var self = this;

    jQuery.getJSON(this.signature_url, function (data) {
      var signatures = data['signatures'];
      for (var i = 0; i < signatures.length; i++) {
        var sig = signatures[i];
        if (sig.valid) {
          var signature_elem =
            `<span class=\"badge badge-sm badge-success ml-2 px-2 \">
              <i class="fas fa-pen-fancy mr-1"></i>
              ${sig.name}
            </span>`;
          jQuery(self.el).append(signature_elem);
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
