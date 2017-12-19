const files      = require('read-dir-files')
const path       = require('path')
const bodyParser = require('body-parser')
const matter     = require('gray-matter')
const Prism      = require('prismjs')
require('prismjs/components/prism-elixir')
require('prismjs/plugins/line-numbers/prism-line-numbers')

const markdown   = require('markdown-it')({
  highlight(str, lang) {
    if (lang && Prism.languages[lang]) {
      try {
        return `<pre class="highlight"><code>${Prism.highlight(str, Prism.languages[lang])}</code></pre>`
      } catch (err) {}
    }
    return `<pre class="highlight"><code>${markdown.utils.escapeHtml(str)}</code></pre>`
  },
})

const directory = lang => path.join(__dirname, '../', 'blog-posts', lang)

module.exports = function() {
  return [
    bodyParser.urlencoded({ extended: true }),
    bodyParser.json(),
    function(req, res) {
      const { lang, slug } = req.params
      const dir = directory(lang)
      files.list(dir, (err, list) => {
        if (err) return res.status(500).end()
        const posts = list
          .filter(filename => filename.endsWith('.md'))
          .map(filename => filename.replace(dir, ''))
          .map(filename => matter.read(path.join(dir, filename)))
          .map(({ content, data }) => ({ data, md: content }))
          .sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
        if (slug) {
          const post = posts.find(post => post.data.slug === slug)
          if (!post) return res.status(404).end()
          return res.end(JSON.stringify({
            data: post.data,
            html: markdown.render(post.md),
          }))
        } else {
          return res.end(JSON.stringify(posts.map(({ data }) => ({ data }))))
        }
      })
    },
  ]
}

