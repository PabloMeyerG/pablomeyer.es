# Uso: perl apply.pl pares.tsv archivo.html
# Cada linea: texto EN ||| texto ES (literal). Avisa si un par no aparece.
use strict; use warnings; use utf8;
binmode STDOUT, ':utf8';
# --optional: no avisar de pares ausentes (tabla comun: no todas las
# paginas tienen todos los elementos)
my $optional = @ARGV && $ARGV[0] eq q{--optional} ? shift : 0;
my ($pairs, $file) = @ARGV;
open my $p, '<:utf8', $pairs or die; my @pairs = grep { / \|\|\| / && !/^#/ } <$p>; close $p;
local $/; open my $h, '<:utf8', $file or die; my $s = <$h>; close $h;
my ($ok, @miss) = (0);
for (@pairs) {
  s/\r?\n\z//;  # no chomp: $/ ya es undef aqui
  my ($en, $es) = split / \|\|\| /, $_, 2;
  my $n = () = $s =~ /\Q$en\E/g;
  if ($n) { $s =~ s/\Q$en\E/$es/g; $ok++ } else { push @miss, $en }
}
open $h, '>:utf8', $file or die; print $h $s; close $h;
print "$file: $ok pares aplicados, ", ($optional ? 0 : scalar(@miss)), " sin encontrar\n";
print "  MISS: $_\n" for ($optional ? () : @miss);
