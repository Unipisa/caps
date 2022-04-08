import jQuery from 'jquery';
import CapsAttachment from '../modules/attachment';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import 'bootstrap-select';

class CapsAppController {

    constructor(root = "/") {
        this.root = root;
        this.enhanceAttachments();
        this.setupBadges();
        this.setupCKEditor();
        this.setupSelect();
    }

    setupSelect() {
        jQuery.fn.selectpicker.Constructor.BootstrapVersion = '4';

        // We enable enriched JS selects on all "multiple"
        // selects, which would be almost unusable otherwise.
        jQuery('select.form-control[multiple]').selectpicker({
            selectedTextFormat: 'count > 7',
            countSelectedText: "{0} elementi selezionati",
            noneSelectedText: "Nessuna selezione",
            liveSearch: true
        });

        Array.from(document.getElementsByClassName('bootstrap-select')).forEach(el => {
            Array.from(el.getElementsByTagName('button')).forEach(el => {
                // We apply a gray-400 border to match the bootstrap theme
                el.style.border = '1px solid #d3e2e4';
            });
        });
    }

    setupCKEditor() {

        for (const el of document.getElementsByClassName('caps-settings-html')) {
            ClassicEditor
                .create(el, {
                    toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', 'link',
                                'bulletedList', 'numberedList',  ]
                })
                .catch(error => {
                    console.log('CAPS::CKEditor Error while loading the CKEditor component:');
                    console.error(error);
                });
        }
    }

    // Add tooltips to badge, and setup onclick handlers 
    setupBadges() {
        jQuery('span.filter-badge').tooltip();

        // Attach the onclick handlers: they remove the parameters from 
        // the query when executed. 
        for (const el of document.getElementsByClassName('filter-badge-link')) {
            const key = el.getAttribute('data-badge-key');
            el.addEventListener('click', () => {
                var url = location.search;
                var rx = new RegExp('[&?]' + key + '=[^&]*');
                location.search = url.replace(rx, '');
            });
        }
    }
    
    enhanceAttachments() {
        jQuery('.pdf-attachment').each(function (idx, el) {
            new CapsAttachment(el);
        })
    }
}

export default CapsAppController;