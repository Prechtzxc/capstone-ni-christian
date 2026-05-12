const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedClient) return
    sendMessage(input, "admin", selectedClient.id)
    setInput("")
  }