// ==UserScript==
// @name         webtoon mod
// @namespace    http://tampermonkey.net/
// @run-at document-end
// @version      0.1
// @description  change list to load every chapters in n - n + 10 page 
// @author       You
// @match        https://www.webtoons.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=webtoons.com
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    const url = new URL( window.location.href )
    const search = url.searchParams 


    /** @type {string} */
    const no_param = !!(url.search) ? url.href.split( url.search )[0] : url.href

    const is_list_page = no_param.endsWith('list') 
    const is_viwer_page = no_param.endsWith('viewer')

    /**
     * @param {string} url 
     * @returns { Promise<Document>}
     */
    const load_html = async url => {
        const parser = new DOMParser()

        const content = await (await fetch( url )).text()

        const doc = parser.parseFromString( content , "text/html" )

        return doc
    }

    if ( is_list_page ) {


        const list = document.querySelector('#_listUl')
        const page_numbers = document.querySelector('.paginate')


        const cur_page = search.get('page') ? Number.parseInt( search.get('page') ) : 1
    
        const page_number_children =  Array.from( 
            page_numbers.children
        )   

        const page_number_elements = page_number_children.filter( e => {
            return !(e.classList.contains('pg_prev') || e.classList.contains('pg_next')) && Number.parseInt ( e.textContent ) > cur_page
        })
        
        const load_page_in_order = async () => {
            for ( const page of page_number_elements ) {
                
                const href = page.href

                if ( href.endsWith('#') )
                    continue

                let doc = await load_html( href )
                const chapters = doc.querySelector('#_listUl')
                
                for( const child of chapters.children ) {
                    list.appendChild( child.cloneNode( true ) )
                    console.log( child )
                }
            }

            page_number_children.forEach( e => {

                if ( !(e.classList.contains('pg_prev') || e.classList.contains('pg_next')) )
                    e.remove()

            })
        }

        load_page_in_order()


    }

    if (is_viwer_page)
        document.querySelector('#cbox_module').style.opacity = 0 // disable comment
})();
