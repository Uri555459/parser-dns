const fs = require('fs')
const puppeteer = require('puppeteer')

let link = 'https://www.dns-shop.ru/catalog/17a8a01d16404e77/smartfony/?p=';

(async () => {
    const t0 = performance.now()
    let flag = true
    let res = []
    let counter = 30

    try {

        let browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            devtools: true
        })
        let page = await browser.newPage()
        await page.setViewport({
            width: 1400, height: 900
        })

        while (flag) {
            await page.goto(`${link}${counter}`)
            await page.waitForSelector('a.pagination-widget__page-link_next')
            console.log('page ', counter)

            let html = await page.evaluate(async () => {
                let page = []

                try {

                    let divs = document.querySelectorAll('div.catalog-product')

                    divs.forEach(div => {
                        let a = div.querySelector('a.ui-link')

                        let obj = {
                            title: a !== null
                                ? a.innerText
                                : 'NO-LINK',
                            link: a.href,
                            img: div.querySelector('.catalog-product__image-link picture img').src,
                            price: div.querySelector('div.product-buy__price').innerText !== null
                                ? div.querySelector('div.product-buy__price').innerText
                                : 'NO-PRICE',
                            rating: div.querySelector('.catalog-product__rating').dataset.rating
                        }

                        page.push(obj)
                    })

                } catch (error) {
                    console.log(error)
                }

                return page
            }, { waitUntil: 'a.pagination-widget__page-link_next' })

            await res.push(html)

            for (let i in res) {
                if (res[i].length === 0) flag = false
            }

            counter++
        }

        await browser.close()

        res = res.flat()

        fs.writeFile('dns.json', JSON.stringify({ 'data': res }), error => {
            if (error) throw error
            console.log('dns.json saved')
            console.log('dns.json - ', res.length);
        })


    } catch (error) {
        console.log(error)
        await browser.close()
    }
    const t1 = performance.now()
    console.log(parseInt((t1 - t0) / 1000), 'seconds')
})()

