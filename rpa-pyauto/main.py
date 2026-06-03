from desktop import entrarSes
from api import enviar_arquivo_api, obter_ultimos_csvs

def main():
    #entrarSes()
    arquivos = obter_ultimos_csvs(quantidade=3)
    
    for arquivo in arquivos:
        enviar_arquivo_api(arquivo)

if __name__ == "__main__":
    main()
