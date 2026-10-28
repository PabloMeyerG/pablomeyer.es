#!/bin/sh
# Genera la version espanola (/es/) a partir de las paginas inglesas.
#
#   sh i18n/build-es.sh
#
# 1. make-es.pl copia cada pagina EN a /es/ y ajusta lang, canonical,
#    og:url, og:locale, rutas a assets compartidos y el selector EN/ES.
# 2. apply.pl aplica las traducciones: primero common.es.txt (cabecera,
#    footer...) y despues la tabla de cada pagina.
# Si una frase de la tabla ya no existe en el ingles, lo avisa (MISS):
# eso significa que el copy EN cambio y hay que actualizar la tabla.
set -e
cd "$(dirname "$0")/.."
mkdir -p es/projects
build() { # $1 origen EN, $2 destino ES, $3 tabla de la pagina
  perl i18n/make-es.pl "$1" "$2"
  perl i18n/apply.pl --optional i18n/common.es.txt "$2"
  perl i18n/apply.pl "i18n/$3" "$2"
}
build index.html             es/index.html            home.es.txt
build projects/iki.html      es/projects/iki.html     iki.es.txt
build projects/coach.html    es/projects/coach.html   coach.es.txt
build projects/galeria.html  es/projects/galeria.html galeria.es.txt
build projects/educa.html    es/projects/educa.html   educa.es.txt
