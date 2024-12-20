function formatarMoeda(valor: number) {
    const valorFormatado = valor.toLocaleString("pt-br",
      {
        style: "currency",
        currency: "BRL"
      }
    )
    return valorFormatado;
}

export { formatarMoeda };