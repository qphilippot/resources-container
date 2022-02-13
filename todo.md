La génération des méta doit se gérer au niveau du conteneur, avant la compilation.

Par défaut, il va vouloir scanner tous le répertoire du projet. Il devra être possible de restreindre ce champ dans les fichiers de configs (type services.yaml) 

```yaml
configuration:
  analyse_class: true

autoload:
  App\:
    resource: '../src/*'
    exclude: '../src/{wepback-plugin, *.ts, *.js, *.yaml, utils, core, publisher-subscriber}'

# si le champ autoload n'est pas précisé
```

# TODO
* diviser le `setFactory` pour n'avoir qu'un seul type possible en entrée. Vérifier les cas d'usages et comment est-ce que l'on pourrait modifier la conceptiona actuelle pour couvrir le même périmetre fonctionnel tout en proposant des règles de typage plus strictes.
* créer un type d'enum pour les InvalidBehavior
* Créer un plugin qui ajoute le fonctionnement "setProperty" pour les définitions at l'auto-wiring
* Créer un définition service / manager => s'occupe de mettre à jour les changes
* Créer un MixedInterface helper
* Definition autoconfigured as feature
* Voir s'il est possible de sortir l'env processor et toute cette logique du container.model et container-builder
* Permettre au container d'utiliser des methodmap qui permettent d'invoquer une methode en fallback du get si aucun alias / service n'est trouvé. Ce fallback devrait retourner un service. ==> Ne pas supporter en V1 car pas de cas d'usage identifié.
