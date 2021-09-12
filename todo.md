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