# `create-like`

## Usage

0. If you haven't already, [go through the setup for the module](/setup).

1. Import the `create-like` element somewhere in the javascript side of your web-app like this:

```js
import '@holochain-open-dev/posts-test/dist/elements/create-like.js'
```

2. Use it in the html side of your web-app like this:

```html
<create-like>
</create-like>
```

> [!WARNING]
> Like all the elements in this module, `<create-like>` needs to be placed inside an initialized `<posts-test-context>`.

## Demo

Here is an interactive demo of the element:

<element-demo>
</element-demo>

<script setup>
import { onMounted } from "vue";
import { PostsTestZomeMock, sampleLike } from "@holochain-open-dev/posts-test/dist/mocks.js";
import { PostsTestStore, PostsTestClient } from "@holochain-open-dev/posts-test";
import { decodeHashFromBase64 } from '@holochain/client';
import { render, html } from "lit";

onMounted(async () => {
  // Elements need to be imported on the client side, not the SSR side
  // Reference: https://vitepress.dev/guide/ssr-compat#importing-in-mounted-hook
  await import('@api-viewer/docs/lib/api-docs.js');
  await import('@api-viewer/demo/lib/api-demo.js');
  await import('@holochain-open-dev/posts-test/dist/elements/posts-test-context.js');
  await import('@holochain-open-dev/posts-test/dist/elements/create-like.js');

  const mock = new PostsTestZomeMock();
  const client = new PostsTestClient(mock);

  const like = await sampleLike(client);

  const record = await mock.create_like(like);

  const store = new PostsTestStore(client);
  
  render(html`
    <posts-test-context .store=${store}>
      <api-demo src="custom-elements.json" only="create-like" exclude-knobs="store">
      </api-demo>
    </posts-test-context>
  `, document.querySelector('element-demo'))
  })


</script>

## API Reference

`create-like` is a [custom element](https://web.dev/articles/custom-elements-v1), which means that it can be used in any web app or website. Here is the reference for its API:

<api-docs src="custom-elements.json" only="create-like">
</api-docs>
