from desktop import entrarSes, excluir_csvs
from csv_utils import  obter_ultimos_csvs, enviar_arquivo_rabbit

def main():
    #entrarSes()
    arquivos = obter_ultimos_csvs(quantidade=3)
            
    for arquivo in arquivos:
        enviar_arquivo_rabbit(arquivo)
        
    #excluir_csvs()

if __name__ == "__main__":
    main()
     
