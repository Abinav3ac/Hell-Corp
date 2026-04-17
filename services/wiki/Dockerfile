FROM php:7.4-apache

# Enable mod_rewrite
RUN a2enmod rewrite

# Setup basic Apache config or just copy files
COPY . /var/www/html/

WORKDIR /var/www/html/

# Ensure flag is in environment (already done via docker-compose)
# But we can also put a fake one in the filesystem
RUN echo "HC{f1l3_syst3m_acc3ss_win}" > /var/secret_flag.txt

EXPOSE 80
