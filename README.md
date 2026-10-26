# Renee Noble — Personal Website

My home on the web: talks, writing, projects, learning resources, and a bit about me.

**Live at [reneenoble.com](https://reneenoble.com)**, hosted on GitHub Pages.

It's plain HTML, CSS, and JavaScript. There's nothing to install and no build step.

## Running it locally

From the repository folder:

```sh
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000). Use the local server rather than double-clicking an HTML file: the shared header, footer, and content lists need it to load properly. Stop it with `Ctrl+C`.

## Updating the site

Most page text lives directly in the HTML files. The lists of talks, articles, projects, and recognition come from JSON files instead.

| What I'm changing | Where to look |
| --- | --- |
| Homepage | [index.html](index.html) |
| Bio | [about.html](about.html) |
| Talks | [data/talks.json](data/talks.json), with detail pages in [talks/](talks/) |
| Articles and blog links | [data/writing.json](data/writing.json) |
| Projects | [data/projects.json](data/projects.json) |
| Awards and media | [data/press.json](data/press.json) |
| Learning resources | [learning.html](learning.html), [education.html](education.html), and [series.html](series.html) |
| Course and series entries in the full collection | [data/courses.json](data/courses.json) and [data/series.json](data/series.json) |
| Navigation and footer | [partials/header.html](partials/header.html) and [partials/footer.html](partials/footer.html) |
| Colours, fonts, and layout | [assets/css/style.css](assets/css/style.css); homepage extras in [assets/css/home.css](assets/css/home.css) |
| Photos and thumbnails | [assets/img/](assets/img/) |
| Contact form | [contact.html](contact.html) and [assets/js/contact.js](assets/js/contact.js) |

For a new JSON entry, copy a similar existing one and replace its details. For a talk with its own page, add the page under [talks/](talks/) and link to it from the entry.

### Adding something to the collection

[collection.html](collection.html) pulls together the six JSON sources and groups everything by year. Add an entry to the relevant file rather than editing the collection page itself.

The field names vary a little between content types:

| Content | Date | Link | Description | Source or context |
| --- | --- | --- | --- | --- |
| Talks | `year` | `detailUrl`, falling back to `videoUrl` or `repoUrl` | `description` | `event` |
| Writing | `date` | `url` | `excerpt` | `platform` |
| Projects | `date` | `url` | `description` | Shown as "Code and resources" |
| Courses and series | `date` | `url` | `description` | `meta` |
| Awards | `year` | `url` | `description` | `organisation` |
| Media | `date` | `url` | `description` | `outlet` |

Every entry uses `title`. Dates can be `"2026"`, `"2026-10"`, or `"2026-10-27"`; for a `year` field, use a number such as `2026`. Entries without a date or year won't appear.

For example, a new course entry in [data/courses.json](data/courses.json) looks like this:

```json
{
  "title": "My new course",
  "url": "https://example.com/course",
  "date": "2026-10",
  "meta": "Self-paced course",
  "description": "A short explanation of what the course covers.",
  "tags": ["Python", "GitHub"],
  "image": "/assets/img/my-course.png"
}
```

Add it inside the existing array, with a comma between entries. Awards and media go in the `awards` and `media` arrays inside [data/press.json](data/press.json).

Images are optional; use a path under [assets/img/](assets/img/). Talks, courses, series, and media can also use `videoUrl` for a YouTube thumbnail when there's no image. Tags are optional too, and aren't used for awards or media in the collection.

To leave a project out of the collection (for example, if it duplicates a video series), add `"inCollection": false` to its entry.

Before publishing, check the changed page locally, click any new links, and have a look at a narrow/mobile layout. If you've added a page, update [sitemap.xml](sitemap.xml) unless it's meant to stay out of search results.

## Visual reference

The main colours are magenta `#8c0656`, navy `#00074d`, gold `#be820f`, and sage `#5b7d6f`. Fonts are Lora for headings, Fraunces for heading ampersands, Inter for body text, and JetBrains Mono for code.

## License

Content © Renee Noble. Code MIT licensed.
