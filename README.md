# mpp-server-dev2

This is a new MPP server currently in development for [MPP.dev](https://www.multiplayerpiano.dev). The original server is old and it needs a new one.

This server uses Bun.

The commit history includes BopItFreak's server because this server is (debatably) a heavy reimplementation of my fork of it.

## How to run

0. Install bun

    ```
    $ curl -fsSL https://bun.sh/install | bash
    ```

1. Configure

    - Copy environment variables

    ```
    $ cp .env.template .env
    ```

    Edit `.env` to your needs.

    - Edit the files in the `config` folder to match your needs

2. Install packages

    ```
    $ bun i
    ```

3. Setup database

    ```
    $ bunx prisma generate
    $ bunx prisma db push
    ```

4. Build

    ```
    $ bun run build
    ```

5. Run

    ```
    $ bun start
    ```
