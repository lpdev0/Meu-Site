const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const runtimeModules = path.join(process.env.USERPROFILE, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules')
let chromium
try { ({ chromium } = require('playwright')) } catch { ({ chromium } = require(path.join(runtimeModules, 'playwright'))) }
const url = process.env.MOTION_TEST_URL || 'http://127.0.0.1:5173'
const report = { fixtures: 'External assets replaced with synthetic SVGs and a two-frame GIF only within this browser test. This does not validate external asset availability.', checks: [], errors: [] }
// A 1×1 red/blue animated GIF, with 150ms frames. No product artwork is modified.
const animatedGif = Buffer.from('47494638396101000100800000ff00000000ff21ff0b4e45545343415045322e30030100000021f904000f0000002c000000000100010000020244010021f904000f0000002c00000000010001000002024c01003b', 'hex')
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function test(name, run) {
  try { const details = await run(); report.checks.push({ name, passed: true, details }) }
  catch (error) { report.checks.push({ name, passed: false, error: error.message }) }
}

;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' })
    page.on('pageerror', error => report.errors.push(error.message))
    await page.route('**/*', route => {
      const request = route.request()
      if (request.url().startsWith(url)) return route.continue()
      if (request.resourceType() === 'image') {
        if (request.url().endsWith('.gif')) return route.fulfill({ contentType: 'image/gif', body: animatedGif })
        const portrait = request.url().includes('Rectangle_40443')
        return route.fulfill({ contentType: 'image/svg+xml', body: `<svg xmlns="http://www.w3.org/2000/svg" width="${portrait ? 520 : 600}" height="${portrait ? 680 : 400}"><rect width="100%" height="100%" fill="#40374e"/><circle cx="50%" cy="50%" r="100" fill="#a2a4bb"/></svg>` })
      }
      return route.abort()
    })
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await test('Hero entrance completes', async () => {
      await delay(1500)
      const values = await page.locator('.hero nav, .hero h1').evaluateAll(nodes => nodes.map(node => ({ opacity: getComputedStyle(node).opacity, transform: getComputedStyle(node).transform })))
      assert(values.every(value => Number(value.opacity) === 1 && value.transform === 'none'))
      return values
    })
    const magnet = page.locator('.hero-portrait').locator('..')
    await test('Magnet follows pointer and settles back', async () => {
      const bounds = await magnet.locator('..').boundingBox()
      await page.mouse.move(bounds.x + bounds.width / 2 + 90, bounds.y + bounds.height / 2 - 60)
      await delay(400)
      const active = await magnet.evaluate(node => { const m = new DOMMatrixReadOnly(getComputedStyle(node).transform); return [m.m41, m.m42] })
      assert(Math.abs(active[0] - 30) < 1 && Math.abs(active[1] + 20) < 1)
      await page.mouse.move(0, 0)
      await delay(700)
      const idle = await magnet.evaluate(node => getComputedStyle(node).transform)
      assert(['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(idle))
      return { active, idle }
    })
    await test('Reduced motion updates immediately after preference changes', async () => {
      const bounds = await magnet.locator('..').boundingBox()
      await page.mouse.move(bounds.x + bounds.width / 2 + 90, bounds.y + bounds.height / 2 - 60)
      await delay(400)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await delay(100)
      const transform = await magnet.evaluate(node => getComputedStyle(node).transform)
      assert(['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(transform), `Magnet remains displaced: ${transform}`)
      return transform
    })
    await test('Pointer leave cancels an already queued magnetic move', async () => {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await delay(80)
      await magnet.locator('..').evaluate(node => {
        const rect = node.getBoundingClientRect()
        window.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'mouse', clientX: rect.left + rect.width / 2 + 90, clientY: rect.top + rect.height / 2 }))
        document.documentElement.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }))
      })
      await delay(700)
      const transform = await magnet.evaluate(node => getComputedStyle(node).transform)
      assert(['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(transform))
      return transform
    })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.reload({ waitUntil: 'networkidle' })
    await test('Marquee moves in opposite directions at 0.3 × scroll', async () => {
      const read = () => page.locator('section[aria-label="Creative inspiration gallery"] .absolute').evaluateAll(nodes => nodes.map(node => new DOMMatrixReadOnly(getComputedStyle(node).transform).m41))
      await page.evaluate(() => scrollTo({ top: 800, behavior: 'instant' })); await delay(100)
      const before = await read()
      await page.evaluate(() => scrollTo({ top: 1200, behavior: 'instant' })); await delay(100)
      const after = await read()
      const changes = after.map((value, index) => value - before[index])
      assert(Math.abs(changes[0] - 120) < 1 && Math.abs(changes[1] + 120) < 1)
      return changes
    })
    await test('Real animated GIF freezes and scroll motion pauses without reload', async () => {
      const gallery = page.locator('section[aria-label="Creative inspiration gallery"]')
      const firstVisibleImage = gallery.locator('img').filter({ visible: true })
      const imageIndex = await gallery.locator('img').evaluateAll(nodes => nodes.findIndex(node => {
        const rect = node.getBoundingClientRect()
        return rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight
      }))
      assert(imageIndex >= 0, 'No fully visible GIF tile')
      const tile = gallery.locator('img').nth(imageIndex).locator('..')
      await firstVisibleImage.first().waitFor()
      await page.waitForFunction(index => document.querySelectorAll('section[aria-label="Creative inspiration gallery"] img')[index].naturalWidth > 0, imageIndex)
      const frames = []
      for(let i=0;i<5;i++) { frames.push(await tile.screenshot({ animations: 'allow' })); await delay(90) }
      assert(frames.some(frame => !frame.equals(frames[0])), 'GIF test fixture was not animating')
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await delay(100)
      const canvas = tile.locator('canvas')
      const frozen1 = await canvas.screenshot()
      await delay(330)
      const frozen2 = await canvas.screenshot()
      assert(frozen1.equals(frozen2), 'Frozen GIF frame changes over time')
      assert(await tile.locator('img').evaluate(node => getComputedStyle(node).visibility === 'hidden'))
      const tracks = gallery.locator(':scope > div > div')
      const before = await tracks.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).transform))
      await page.evaluate(() => scrollBy({ top: 100, behavior: 'instant' }))
      await delay(100)
      const after = await tracks.evaluateAll(nodes => nodes.map(node => getComputedStyle(node).transform))
      assert.deepEqual(after, before)
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await delay(80)
      assert(await gallery.locator('canvas').count() === 0)
      return { animatedFramesDiffer: true, frozenFramesIdentical: true, scrollPaused: true, resumedWithoutReload: true }
    })
    await test('About paragraph reveals progressively and fully', async () => {
      const paragraph = page.locator('#about p')
      const bounds = await paragraph.evaluate(node => ({ top: node.getBoundingClientRect().top + scrollY, height: node.offsetHeight }))
      const averages = []
      for (const progress of [0, 0.5, 1]) {
        await page.evaluate(({ top, height, progress }) => scrollTo({ top: top - innerHeight * .8 + progress * (innerHeight * .6 + height), behavior: 'instant' }), { ...bounds, progress })
        await delay(120)
        averages.push(await paragraph.locator('span.absolute').evaluateAll(nodes => nodes.reduce((sum, node) => sum + Number(getComputedStyle(node).opacity), 0) / nodes.length))
      }
      assert(averages[0] < .25 && averages[1] > .45 && averages[1] < .75 && averages[2] > .99)
      return averages
    })
    await test('Project stack scales down while retaining 28px spacing', async () => {
      const stackTop = await page.locator('.project-stack').evaluate(node => node.getBoundingClientRect().top + scrollY)
      await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), stackTop + 2 * 850 - 128)
      await delay(150)
      const cards = await page.locator('.project-card').evaluateAll(nodes => nodes.map(node => ({ top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom, scale: new DOMMatrixReadOnly(getComputedStyle(node).transform).m11 })))
      assert(cards[0].scale < .96 && cards[1].scale < .99 && cards[2].scale === 1)
      assert(Math.abs(cards[1].top - cards[0].top - 28) < 2 && Math.abs(cards[2].top - cards[1].top - 28) < 2, JSON.stringify(cards))
      assert(cards[2].bottom <= 1000, 'Last card clipped below viewport')
      return cards
    })
    await test('Reduced motion shows static previews and non-stacking cards', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.reload({ waitUntil: 'networkidle' })
      const positions = await page.locator('.project-slot').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).position))
      assert(positions.every(value => value !== 'sticky'), 'Cards still stick with reduced motion enabled')
      assert(await page.locator('section[aria-label="Creative inspiration gallery"] canvas').count() > 0, 'GIFs have no frozen frame alternative')
      return positions
    })
    await test('Mobile and short-screen cards stay readable without overflow', async () => {
      const sizes = [{width:320,height:740},{width:390,height:844},{width:844,height:390},{width:768,height:700},{width:1920,height:1080}]
      const measurements = []
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      for (const size of sizes) {
        await page.setViewportSize(size)
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
        await delay(80)
        const result = await page.evaluate(() => {
          const cards = [...document.querySelectorAll('.project-card')]
          const stickyTop = innerWidth >= 768 ? 128 : 96
          return {width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,sticky:getComputedStyle(document.querySelector('.project-slot')).position,cardsFit:cards.every((card,index)=>card.offsetHeight+stickyTop+index*28+24<=innerHeight)}
        })
        assert(result.overflow === 0)
        if(size.height < 650) assert(result.sticky !== 'sticky')
        if(size.height > 650) assert.equal(result.sticky, 'sticky')
        measurements.push(result)
      }
      return measurements
    })
  } finally { await browser.close() }
  fs.mkdirSync('test-results', { recursive: true })
  fs.writeFileSync('test-results/motion-review.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if(report.errors.length || report.checks.some(check => !check.passed)) process.exitCode = 1
})().catch(error => { console.error(error); process.exitCode = 1 })
