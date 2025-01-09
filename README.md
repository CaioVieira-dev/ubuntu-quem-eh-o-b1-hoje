# Qhem é o B1 hoje?

Projetinho para mergulhar no nextJs e na API do ClickUp :)

## Rodando

```zsh
cd quem-eh-o-b1-hoje
./start-database.sh
pnpm dev
```

## Para ver o banco

```zsh
cd quem-eh-o-b1-hoje
pnpm db:studio
```

## Alterações no banco?

Para atualizar em desenvolvimento rode:

```zsh
pnpm db:push
```

Para atualizar em produção rode:

```zsh
pnpm db:generate
```

e depois comite a migração. Ao mesclar a vercel vai aplicar as migrações.
