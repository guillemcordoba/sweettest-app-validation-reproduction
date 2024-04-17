# Setup

> [!WARNING]
> This guide assumes that you have scaffolded a hApp with the [holochain-open-dev template](https://github.com/holochain-open-dev/templates).

1. Run this to scaffold this zome in your hApp:

```bash
nix run github:holochain-open-dev/posts#scaffold
```

This will do the following:
  - Add the flake input for that repository in your `flake.nix`.
  - Add the appropriate zome packages to the `dna.nix` that you select.
  - Add the UI package for that zome in the local NPM package that you select.

Now you only need to integrate the zome's frontend in your web-app.

2. Connect to Holochain with the `AppAgentClient`, and create the `PostsStore` with it:

```js
import { PostsStore, PostsClient } from "@holochain-open-dev/profiles";
import { AppAgentWebsocket } from "@holochain/client";

async function setupPostsStore() {
  const client = await AppAgentWebsocket.connect(new URL('ws://localhost'), '')

  // TODO: change "MY_CELL_ROLE" for the roleId that you can find in your "happ.yaml"
  return new PostsStore(new PostsClient(client, '<MY_CELL_ROLE>'));
}
```

3. Import the `<posts-context>` element and add it to your html **wrapping the whole section of your page in which you are going to be placing** the other elements from `@holochain-open-dev/posts`:

```js
// This can be placed in the index.js, at the top level of your web-app.
import "@holochain-open-dev/posts/elements/posts-context.js";
```

And then add the `<posts-context>` element in your html:

```html
<posts-context>
  <!-- Add here other elements from @holochain-open-dev/posts -->
</posts-context>
```

4. Attach the `postsStore` to the `<posts-context>` element:

- Go to [this page](https://holochain-open-dev.github.io/reusable-modules/frontend/frameworks/), select the framework you are using, and follow its example.

You need to set the `store` property of it to your already instantiated `PostsStore` object:

- If you **are using some JS framework**:


::: code-group
```html [React]
<posts-context store={ postsStore}><!-- ... --></posts-context>
```

```html [Angular]
<posts-context [store]="postsStore"><!-- ... --></posts-context>
```

```html [Vue]
<posts-context :store="postsStore"><!-- ... --></posts-context>
```

```html [Svelte]
<posts-context store={ postsStore}><!-- ... --></posts-context>
```

```html [Lit]
<posts-context .store=${ postsStore}><!-- ... --></posts-context>
```
:::

OR

- If you **are not using any framework**:

```js
const contextElement = document.querySelector("posts-context");
contextElement.store = store;
```

> You can read more about the context pattern [here](https://holochain-open-dev.github.io/reusable-modules/frontend/using/#context).

5. [Choose which elements you need](?path=/docs/frontend-elements) and import them like this:

```js
import "@holochain-open-dev/posts/elements/posts-context.js";
```

And then they are ready be used inside the `<posts-context>` just like any other HTML tag.

This will define all the elements from this module in the global `CustomElementsRegistry`. You can read more about Custom Elements [here](https://developers.google.com/web/fundamentals/web-components/customelements).

6. Add your preferred shoelace theme in your `<head>` tag:

```html
  <head>
    <link rel="stylesheet" href="path/to/shoelace/dist/themes/light.css" />
  </head>
```

You can read more about how to initialize the shoelace theme [here](https://shoelace.style/getting-started/themes?id=activating-themes).

---

That's it! You have now integrated both the backend and the frontend for the profiles module.

# Example

You can see a full working example of the UI working in [here](https://github.com/holochain-open-dev/profiles/blob/main/ui/demo/index.html).

