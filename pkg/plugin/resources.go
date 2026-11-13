package plugin

import (
	"io"
	"net/http"
	"time"
)

const llamaChatURL = "http://YOUR_LLAMA_SERVER_IP:8080/v1/chat/completions"

var llamaClient = &http.Client{
	Timeout: 10 * time.Minute, // Даем время K80 подумать
}

func (a *App) registerRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/chat", a.handleChat)
}

func (a *App) handleChat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	req, err := http.NewRequestWithContext(r.Context(), http.MethodPost, llamaChatURL, r.Body)
	if err != nil {
		http.Error(w, "failed to create llama request: "+err.Error(), http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := llamaClient.Do(req)
	if err != nil {
		http.Error(w, "llama.cpp request failed: "+err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	ct := resp.Header.Get("Content-Type")
	if ct == "" {
		ct = "application/json"
	}
	w.Header().Set("Content-Type", ct)
	w.WriteHeader(resp.StatusCode)
	_, _ = io.Copy(w, resp.Body)
}
