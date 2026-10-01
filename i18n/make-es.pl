use strict; use warnings;
my ($src, $dst) = @ARGV;
local $/; open my $h, '<', $src or die; my $s = <$h>; close $h;
my $base = 'https://pablomeyer.es';
my $n;
$s =~ s{<html lang="en">}{<html lang="es">} or die "lang";
$s =~ s{"inLanguage": "en"}{"inLanguage": "es"}g;
$s =~ s{<meta property="og:locale" content="en_US">\n<meta property="og:locale:alternate" content="es_ES">}{<meta property="og:locale" content="es_ES">\n<meta property="og:locale:alternate" content="en_US">} or die "locale";
if ($src eq 'index.html') {
  $s =~ s{<link rel="canonical" href="$base/">}{<link rel="canonical" href="$base/es/">} or die "canon";
  $s =~ s{<meta property="og:url" content="$base/">}{<meta property="og:url" content="$base/es/">} or die "ogurl";
  $s =~ s{(href|src)="(assets/|favicon|icon-192|apple-touch)}{$1="../$2}g;
  $s =~ s{(srcset="|, )assets/}{$1../assets/}g;
  # selector: EN apunta a la home inglesa, ES es la actual
  $n = ($s =~ s{<a href="\./" hreflang="en" lang="en" title="English" aria-current="true" data-lang-switch>EN</a><span class="nav-lang-sep" aria-hidden="true">/</span><a href="es/" hreflang="es" lang="es" title="Español" data-lang-switch>ES</a>}{<a href="../" hreflang="en" lang="en" title="English" data-lang-switch>EN</a><span class="nav-lang-sep" aria-hidden="true">/</span><a href="./" hreflang="es" lang="es" title="Español" aria-current="true" data-lang-switch>ES</a>}g);
  die "switch $n" unless $n == 2;
} else {
  my ($page) = $src =~ m{projects/(\w+)\.html$} or die;
  $s =~ s{<link rel="canonical" href="$base/projects/$page\.html">}{<link rel="canonical" href="$base/es/projects/$page.html">} or die "canon";
  $s =~ s{<meta property="og:url" content="$base/projects/$page\.html">}{<meta property="og:url" content="$base/es/projects/$page.html">} or die "ogurl";
  $s =~ s{"url": "$base/projects/$page\.html"}{"url": "$base/es/projects/$page.html"} or die "ldurl";
  $s =~ s{(href|src)="\.\./(assets/|favicon|icon-192|apple-touch)}{$1="../../$2}g;
  $s =~ s{(srcset="|imagesrcset="|, )\.\./assets/}{$1../../assets/}g;
  $s =~ s{href="(project|iki|playground|coach)\.css"}{href="../../projects/$1.css"}g;
  $s =~ s{src="(iki|coach)\.js"}{src="../../projects/$1.js"}g;
  $s =~ s{(data-src|poster)="\.\./assets/}{$1="../../assets/}g;
  $s =~ s{<a href="$page\.html" hreflang="en" lang="en" title="English" aria-current="true" data-lang-switch>EN</a><span class="nav-lang-sep" aria-hidden="true">/</span><a href="\.\./es/projects/$page\.html" hreflang="es" lang="es" title="Español" data-lang-switch>ES</a>}{<a href="../../projects/$page.html" hreflang="en" lang="en" title="English" data-lang-switch>EN</a><span class="nav-lang-sep" aria-hidden="true">/</span><a href="$page.html" hreflang="es" lang="es" title="Español" aria-current="true" data-lang-switch>ES</a>} or die "switch";
  $s =~ s{<a href="\.\./es/projects/$page\.html" hreflang="es" lang="es" title="Ver esta página en español" data-lang-switch>ES</a>}{<a href="../../projects/$page.html" hreflang="en" lang="en" title="View this page in English" data-lang-switch>EN</a>} or die "mini";
}
open $h, '>', $dst or die; print $h $s; close $h; print "$dst ok\n";
