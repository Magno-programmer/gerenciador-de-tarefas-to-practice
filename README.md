# README — Ambiente Docker, WSL e PostgreSQL (Gerenciador de Tarefas)

Este README documenta **os problemas reais** que apareceram ao subir o ambiente do projeto (API + Postgres) e as **soluções** passo a passo. Serve como guia rápido para repetir a configuração no futuro.

---

## Sumário

* [TL;DR (atalho rápido)](#tldr-atalho-rápido)
* [Pré‑requisitos](#pré-requisitos)
* [Escolha do terminal: PowerShell x WSL](#escolha-do-terminal-powershell-x-wsl)
* [Docker Compose — serviço `db` (PostgreSQL)](#docker-compose-—-serviço-db-postgresql)
* [Variáveis de ambiente (`.env`)](#variáveis-de-ambiente-env)
* [Conexões: do host x de outro container](#conexões-do-host-x-de-outro-container)
* [Volumes: o que são e onde ficam](#volumes-o-que-são-e-onde-ficam)
* [Erros comuns e soluções](#erros-comuns-e-soluções)
* [Rodando Docker pelo WSL (sem daemon duplicado)](#rodando-docker-pelo-wsl-sem-daemon-duplicado)
* [Checklist de sanidade (30 segundos)](#checklist-de-sanidade-30-segundos)
* [Comandos úteis](#comandos-úteis)

---

## TL;DR (atalho rápido)

1. **Abra o Docker Desktop** no Windows (Settings → General: *Use WSL 2 based engine*).
2. **Habilite a integração WSL** (Settings → Resources → WSL Integration → marque sua distro).
3. No **PowerShell** (ou no WSL, se configurado), rode:

   ```bash
   docker compose up -d --build
   docker compose ps
   ```
4. Conecte no **pgAdmin**: `localhost:5432`, user `postgres`, senha do seu `.env`.

---

## Pré‑requisitos

* **Windows 10/11** com virtualização ligada no BIOS/UEFI.
* **WSL 2** habilitado (opcional, mas recomendado para trabalhar no Ubuntu dentro do VSCode).
* **Docker Desktop** instalado e em execução.
* **pgAdmin 4** (opcional, para gerenciar o Postgres graficamente).

> Dica: nas **Settings** do Docker Desktop, ative **“Start Docker Desktop when you log in”** para ele iniciar com o Windows.

---

## Escolha do terminal: PowerShell x WSL

* **PowerShell (Windows):** tudo “fala” direto com o Docker Desktop. `localhost` é o próprio Windows.
* **WSL (Ubuntu):** use a **CLI** do Docker dentro do WSL **conversando com o daemon do Docker Desktop** (não instale um segundo daemon). Veja [Rodando Docker pelo WSL](#rodando-docker-pelo-wsl-sem-daemon-duplicado).

> Importante: **se a API estiver em container**, não use `localhost` para falar com o Postgres do Compose. Use o **nome do serviço**: `db`.

---

## Docker Compose — serviço `db` (PostgreSQL)

Exemplo mínimo usado no projeto:

```yaml
services:
  db:
    image: postgres:15
    ports:
      - "5432:5432"     # expõe a porta do container para o host
    environment:
      POSTGRES_DB: taskdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

**Explicando:**

* `image: postgres:15` → usa a imagem oficial, versão fixada (evita surpresas do `latest`).
* `ports: "5432:5432"` → mapeia a porta do container para o **host**. Acesso via `localhost:5432` no Windows.
* `environment` → cria banco/usuário/senha **na primeira inicialização** (volume ainda vazio). **Obrigatório** definir `POSTGRES_PASSWORD`.
* `volumes` → **persiste os dados** fora do container. Recriar container ≠ perder dados.

> Se já existir um volume inicializado, mudar `POSTGRES_*` depois **não altera** credenciais antigas. Para reinicializar, remova o volume (veja seção de Volumes).

---

## Variáveis de ambiente (`.env`)

Crie um arquivo `.env` na mesma pasta do `docker-compose.yml`:

```env
POSTGRES_PASSWORD=SuaSenhaForteAqui
```

**API (exemplos):**

```env
PORT=3000
# API no host (Windows) falando com o Postgres publicado no host
DATABASE_URL=postgres://postgres:SuaSenhaForteAqui@localhost:5432/taskdb
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h
```

**API em container (Compose):**

```env
PORT=3000
# Dentro da rede do Compose, use o nome do serviço do banco
DATABASE_URL=postgres://postgres:SuaSenhaForteAqui@db:5432/taskdb
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h
```

> Remova espaços ao redor do `=` no `.env`. Se a senha tiver caracteres especiais (`@:/?#&`), faça **URL‑encode** ao usá-la na `DATABASE_URL`.

---

## Conexões: do host x de outro container

* **Do host (pgAdmin/psql no Windows):**

  * Host: `localhost`
  * Porta: `5432`
  * Usuário: `postgres`
  * Senha: `POSTGRES_PASSWORD` do `.env`
  * Database: `taskdb` (ou `postgres` para manutenção)

* **De dentro de outro container (sua API):**

  * Host: **`db`** (nome do serviço do Compose)
  * Porta: `5432`
  * Usuário/Senha/DB: mesmo do `.env`

> Dentro de containers, `localhost` aponta para **o próprio container**, não para o Postgres.

---

## Volumes: o que são e onde ficam

* No Compose: `db-data:/var/lib/postgresql/data` monta um **volume nomeado** no diretório de dados do Postgres.
* **Listar volumes:**

  ```bash
  docker volume ls
  ```
* **Inspecionar (ver caminho real/Mountpoint):**

  ```bash
  docker volume inspect <nome-do-volume>
  ```
* **Local (Docker Desktop + WSL2):** via Explorer:
  `\\wsl$\docker-desktop-data\version-pack-data\community\docker\volumes\<nome-do-volume>\_data`
* **Cuidado:** não edite arquivos do Postgres diretamente. Prefira `pg_dump`/`psql` para backup/restore.
* **Apagar dados (irrevogável):**

  ```bash
  docker compose down -v   # remove containers e VOLUMES
  ```

---

## Erros comuns e soluções

### 1) `docker : termo não é reconhecido` (PowerShell)

* **Causa:** Docker Desktop não instalado ou PATH não atualizado.
* **Solução:** instalar **Docker Desktop**, fechar/abrir o terminal e testar:

  ```powershell
  docker --version
  docker compose version
  ```

### 2) `unknown command: compose` ou erro ao usar `docker composer`

* **Causa:** digitou `docker composer` (com **r**) ou não tem o Compose v2.
* **Solução:** use `docker compose` (sem **r**). Em ambientes antigos, use `docker-compose` (v1) ou ative o Compose V2 no Docker Desktop.

### 3) `Cannot connect to the Docker daemon at unix:///var/run/docker.sock`

* **Causa:** daemon não está rodando **ou** o WSL não está integrado ao Desktop.
* **Solução:**

  1. **Abra o Docker Desktop** (deixe em *Running*).
  2. Settings → Resources → **WSL Integration** → habilite sua distro.
  3. Reinicie o WSL: `wsl --shutdown` (no Windows) e abra o Ubuntu de novo.
  4. No WSL, confirme o socket:

     ```bash
     ls -l /mnt/wsl/shared-docker/docker.sock
     sudo ln -sf /mnt/wsl/shared-docker/docker.sock /var/run/docker.sock
     ```
  5. Coloque seu usuário no grupo `docker`:

     ```bash
     sudo usermod -aG docker $USER && newgrp docker
     ```

### 4) `permission denied while trying to connect to the Docker daemon socket`

* **Causa:** seu usuário não está no grupo `docker` **ou** falta integração WSL.
* **Solução:** `sudo usermod -aG docker $USER && newgrp docker` e verifique WSL Integration.

### 5) `Unable to connect to server: connection timeout expired (localhost:5432)`

* **Causa:** ninguém está escutando na porta 5432 do host (serviço não subiu, porta não publicada ou conflito).
* **Solução:**

  * Garanta `ports: "5432:5432"` no Compose.
  * Verifique containers/logs:

    ```bash
    docker compose ps
    docker logs db --tail=50
    ```
  * Teste a porta no Windows:

    ```powershell
    Test-NetConnection -ComputerName localhost -Port 5432
    ```

### 6) `password authentication failed for user "postgres"`

* **Causa:** credenciais incorretas **ou** volume antigo com senha diferente.
* **Solução:**

  * Confirme `.env` e conexão.
  * Se for primeira vez, garanta `POSTGRES_PASSWORD` no Compose.
  * Se precisa “zerar” credenciais: `docker compose down -v` (apaga dados!) e suba novamente.
  * Alternativa via `psql`: `ALTER USER postgres WITH PASSWORD 'novaSenha';`

### 7) `Database is uninitialized and superuser password is not specified`

* **Causa:** primeira inicialização do Postgres **sem** `POSTGRES_PASSWORD`.
* **Solução:** defina `POSTGRES_PASSWORD` (no `.env`/Compose) e suba de novo. Valide com `docker compose config` se a env está sendo lida.

### 8) `netstat`/`findstr 5432` não retorna nada

* **Causa:** ninguém escuta na 5432 no host.
* **Solução:** publicar porta no Compose, subir o container e checar `docker logs db`.

### 9) Conectei do container usando `localhost` e falhou

* **Causa:** dentro do container, `localhost` é o próprio container.
* **Solução:** use `host=db` (nome do serviço) e `port=5432`.

### 10) Confusão PowerShell x WSL

* **Sintoma:** no WSL dá erro de daemon; no PowerShell funciona.
* **Solução:** ou use só PowerShell **ou** configure o WSL conforme a seção abaixo. Seja consistente.

---

## Rodando Docker pelo WSL (sem daemon duplicado)

**Objetivo:** usar o **Docker Desktop** como daemon e, no WSL, apenas a **CLI**.

1. **No Docker Desktop (Windows):**

   * Settings → General: *Use WSL 2 based engine*.
   * Settings → Resources → WSL Integration: habilite sua distro (Ubuntu) → *Apply & Restart*.

2. **No WSL (uma única vez por distro):**

   ```bash
   # Repositório oficial da Docker + instalação da CLI e do Compose v2
   sudo apt-get update
   sudo apt-get install -y ca-certificates curl gnupg lsb-release
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update
   sudo apt-get install -y docker-ce-cli docker-compose-plugin

   # Grupo docker (evita usar sudo em todo comando)
   sudo usermod -aG docker $USER
   newgrp docker

   # (Se necessário) aponte o socket padrão para o do Desktop
   ls -l /mnt/wsl/shared-docker/docker.sock && sudo ln -sf /mnt/wsl/shared-docker/docker.sock /var/run/docker.sock
   ```

3. **Teste:**

   ```bash
   docker version
   docker compose version
   docker ps
   ```

> Esses passos são **persistentes**. Você **não** precisa repetir sempre — apenas quando criar outra distro do WSL ou reinstalar o ambiente.

---

## Checklist de sanidade (30 segundos)

```bash
# 1) O Docker Desktop está aberto? (no Windows)
# 2) CLI responde?
docker version && docker compose version

# 3) Consigo falar com o daemon?
docker ps

# 4) Containers do projeto rodando?
docker compose ps

# 5) Postgres pronto?
docker logs db --tail=50   # "database system is ready to accept connections"
```

---

## Comandos úteis

```bash
# Subir/atualizar containers
docker compose up -d --build

# Ver estado e logs
docker compose ps
docker logs db --tail=100

# Testar porta no Windows (PowerShell)
Test-NetConnection -ComputerName localhost -Port 5432

# Testar conexão via psql (host Windows)
psql "postgres://postgres:SuaSenhaForteAqui@localhost:5432/taskdb"

# Resetar tudo (CUIDADO: apaga dados)
docker compose down -v

# Inspecionar volumes e mountpoint
docker volume ls
docker volume inspect <nome-do-volume>

# Dentro do container (shell)
docker exec -it <nome-ou-id-do-container-db> bash
```

---

**Pronto!** Com este guia você deve conseguir reproduzir o ambiente, entender o `docker-compose.yml`, localizar volumes e resolver os erros mais comuns (timeout, senha, daemon/sock). Se algo diferente aparecer, anote a mensagem exata e seguimos ampliando o README.
