# mpp-server-dev2

This is a new MPP server currently in development for [MPP.dev](https://www.multiplayerpiano.dev). The original server is old and it needs a new one.

This server uses Bun.

The commit history includes BopItFreak's server because this server is (debatably) a heavy reimplementation of my fork of it.

## How to run

0. Install bun

    ```
    $ curl -fsSL https://bun.sh/install | bash
    ```

1. Setup Git submodules

    ```
    $ git submodule update --init
    ```

2. Configure

    - Copy environment variables

    ```
    $ cp .env.template .env
    ```

    Edit `.env` to your needs.

    - Edit the files in the `config` folder to match your needs

3. Install packages

    ```
    $ bun i
    ```

4. Setup database

    ```
    $ bunx prisma generate
    $ bunx prisma db push
    ```

5. Build

    ```
    $ bun run build
    ```

6. Run

    ```
    $ bun start
    ```

## Development

```
$ bun dev
```
