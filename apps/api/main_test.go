package main

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gofiber/fiber/v2"
)

type Skill struct {
    ID   string `json:"id"`
    Slug string `json:"slug"`
    Title string `json:"title"`
}

// helper para iniciar o app (simplificado)
func setupApp() *fiber.App {
    app := fiber.New()
    // rotas placeholder – implementar posteriormente
    app.Post("/skills", func(c *fiber.Ctx) error { return c.SendStatus(http.StatusCreated) })
    app.Get("/skills/:id", func(c *fiber.Ctx) error { return c.JSON(Skill{ID: c.Params("id"), Slug: "exemplo", Title: "Exemplo"}) })
    return app
}

func TestCreateSkill(t *testing.T) {
    app := setupApp()
    payload := map[string]string{"slug": "exemplo", "title": "Exemplo"}
    body, _ := json.Marshal(payload)
    req := httptest.NewRequest(http.MethodPost, "/skills", bytes.NewReader(body))
    req.Header.Set("Content-Type", "application/json")
    resp, err := app.Test(req)
    if err != nil {
        t.Fatalf("erro ao executar request: %v", err)
    }
    if resp.StatusCode != http.StatusCreated {
        t.Fatalf("esperado %d, obtido %d", http.StatusCreated, resp.StatusCode)
    }
}

func TestGetSkill(t *testing.T) {
    app := setupApp()
    req := httptest.NewRequest(http.MethodGet, "/skills/123", nil)
    resp, err := app.Test(req)
    if err != nil {
        t.Fatalf("erro ao executar request: %v", err)
    }
    if resp.StatusCode != http.StatusOK {
        t.Fatalf("esperado %d, obtido %d", http.StatusOK, resp.StatusCode)
    }
    var skill Skill
    if err := json.NewDecoder(resp.Body).Decode(&skill); err != nil {
        t.Fatalf("erro ao decodificar resposta: %v", err)
    }
    if skill.ID != "123" {
        t.Fatalf("ID inesperado: %s", skill.ID)
    }
}
