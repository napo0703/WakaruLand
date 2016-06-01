<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{http_host} ^wakaruland.herokuapp.com
    RewriteRule ^(.*)$ https://wakaruland.com/$1 [R=301,L]
</IfModule>