const jQuery = require('jquery');
const CapsAttachment = require('../modules/attachment');
const ClassicEditor = require('@ckeditor/ckeditor5-build-classic');

require('bootstrap-select');

class CapsAppController {

    constructor(root = "/") {
        this.root = root;
        this.updateProposalsURL();
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
    
    // Replace all href attributes of a.caps-proposal-link tags, to ensure that
    // they point to the proposals page with the filters set at the last visit.
    updateProposalsURL() {
        let url = this.getProposalsURL();
        for (const el of document.getElementsByClassName('caps-proposal-link')) {
            el.setAttribute('href', url);
        }
    }

    getProposalsURL() {
        const f = JSON.parse(sessionStorage.getItem('proposals-filter'));

        if (f == null) {
            return this.root + 'proposals';
        }
        else {
            // We selectively read some query parameters from the saved ones, as
            // these are the only "officially supported ones".
            const supported_fields = [
                'state', 'surname', 'academic_year', 'degree', 
                'curriculum', 'exam_name', 'free_exam_name', 
                'page'];
            if (!f.page) f.page = '1';

            const query_string = supported_fields.map(
                function(field) {
                    return field + '=' + encodeURI(f[field] == undefined ? '' : f[field])
                }).join('&');
                
            return this.root + 'proposals?' + query_string;
        }
    }

    enhanceAttachments() {
        jQuery('.pdf-attachment').each(function (idx, el) {
            new CapsAttachment(el);
        })
    }
}

module.exports = CapsAppController;