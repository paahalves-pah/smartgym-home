
from app.models.nlu_model import NLUModel


modelo = NLUModel()
resultado = modelo.treinar()

print("\nTREINAMENTO CONCLUÍDO")
print("=====================")
print("Total de frases:", resultado["total_frases"])
print("Total de intenções:", resultado["total_intencoes"])

print("\nDistribuição das intenções:")
for intencao, quantidade in resultado["distribuicao"].items():
    print(f"{intencao}: {quantidade}")

print("\nRelatório de classificação:")
print(resultado["relatorio"])

print("Modelo salvo em:", resultado["modelo_salvo"])
print("Matriz salva em:", resultado["matriz_salva"])
