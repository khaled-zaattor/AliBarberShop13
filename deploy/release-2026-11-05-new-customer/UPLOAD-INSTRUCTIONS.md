# Release 2026-11-05: clients table + "new customer" for Google Ads

This release tells Google Ads whether each booking comes from a **new** or **returning** customer, so it can bid more for new ones.

- **API:** adds a `clients` table and a `client_identifiers` table. Each booking is linked to a client and saved with `is_new_customer`. Phone and email visit counts now update live, no Sync button needed.
- **Customer site:** the `booking_completed` event now includes `new_customer: true/false`.
- **Dashboard:** shows a green **New** badge next to first-time customers. Phone visits and Email visits work as before.

## What's in it

| Part | In this release? | Archive |
| --- | --- | --- |
| Laravel API (`api.alisbarbershop.com`) | Yes, 9 files | `backend-changes.zip` |
| Database | **Yes, 2 migrations** | inside `backend-changes.zip` |
| Customer website (`alisbarbershop.com`) | Yes | `customer-website.zip` |
| Dashboard (`manage.alisbarbershop.com`) | Yes | `dashboard.zip` |
| Composer / `vendor/` | No changes | — |

Still left out on purpose: the Resend email changes (`composer.json`, `composer.lock`, `config/`, `resources/views/emails/`). Don't upload those from your local copy.

## What the migration does to the database

1. It creates the `clients` and `client_identifiers` tables, then adds `client_id` and `is_new_customer` to `appointments`.
2. It links every existing appointment to a client, oldest first. Each client's first appointment is marked as new, and later ones as returning.
3. It copies the old phone and email counts from `client_visit_counts`. Each count keeps the higher of the old and rebuilt numbers, so visits from appointments that were deleted are kept. Clients whose appointments were all deleted are recreated, so they still count as returning.
4. It **drops** the old `client_visit_counts` and `counted_appointment_visits` tables.

Step 4 deletes data, which is why the database backup below is required.

## Before you start

1. **Back up the database.** In hPanel go to **Databases → phpMyAdmin**, select the API database, then **Export → Quick → SQL → Go**. Keep the `.sql` file.
2. **Back up the live files you're about to replace.**
   - In the Laravel root: `app/Services/AppointmentService.php`, `app/Http/Controllers/Api/Admin/AppointmentController.php`, `app/Http/Resources/AppointmentResource.php` and `app/Models/Appointment.php`.
   - In the dashboard root and in `public_html`: `index.html`.
3. **Check the downloads aren't corrupted.** In PowerShell, from this folder, run `Get-FileHash .\*.zip -Algorithm SHA256`. The results should match `SHA256SUMS.txt`.

## Deploy

Use hPanel → **Websites → Manage**. You need **Terminal** (under Advanced) for the API steps. If you can't use it, ask Hostinger support to run the commands for you.

Do the steps in this order. Upload the API code and run the migration together: if the new code runs before the migration, bookings fail, and if the migration runs before the new code, it can't find the new classes.

1. **Put the API in maintenance mode.** Customers can't book for the 2–3 minutes this takes, so do it at a quiet time. In Terminal, from the Laravel root (the folder with `artisan`):
   ```sh
   php artisan down
   ```
2. **Upload the API code.** Upload `backend-changes.zip` to the Laravel root. Do **not** put it in `public/`.

   **Don't extract it with File Manager.** File Manager can replace the whole `app/` and `database/` folders, which deletes every other file in them. This happened on the first attempt at this release. Merge the files in with Terminal instead:
   ```sh
   mkdir -p ~/release-new-customer
   unzip -o backend-changes.zip -d ~/release-new-customer
   cp -rv ~/release-new-customer/app/. app/
   cp -rv ~/release-new-customer/database/. database/
   ls app/Providers app/Mail
   ```
   `cp` should list 9 files, and the last `ls` must still show `AppServiceProvider.php` and the mail classes. The 9 files it adds or replaces:
   - `app/Models/Client.php`, `app/Models/ClientIdentifier.php`, `app/Models/Appointment.php`
   - `app/Services/ClientService.php`, `app/Services/AppointmentService.php`
   - `app/Http/Controllers/Api/Admin/AppointmentController.php`, `app/Http/Resources/AppointmentResource.php`
   - `database/migrations/2026_11_05_000001_create_clients_table.php`, `database/migrations/2026_11_05_000002_drop_client_visit_counts_tables.php`
3. **Run the migration and bring the API back up.**
   ```sh
   php artisan migrate --force
   php artisan optimize:clear
   php artisan up
   ```
   `migrate` should print two `DONE` lines. If it shows an error, **don't run `up` yet**. Go to Rollback below.
4. **Delete the old classes nothing uses anymore.** These files are in the Laravel root:
   - `app/Services/ClientVisitCountService.php`
   - `app/Models/ClientVisitCount.php`
   - `app/Models/CountedAppointmentVisit.php`
5. **Dashboard.** Upload `dashboard.zip` into the dashboard's document root, extract it there and allow it to overwrite. Keep the existing `.htaccess`, and don't delete old files in `static/`.
6. **Customer website.** Upload `customer-website.zip` into `public_html`, extract it there and allow it to overwrite. Files must land directly in `public_html`, not inside a subfolder. Don't delete old files in `assets/`.
7. **Clean up.** Delete the three ZIP files from the server, especially `backend-changes.zip`.
8. **Purge the cache.** Go to hPanel → **Performance → CDN → Purge all**. Purge LiteSpeed Cache too if it's enabled.

## Verify

- [ ] **Database:** in phpMyAdmin, `clients` and `client_identifiers` have rows. Run `SELECT COUNT(*) FROM appointments WHERE client_id IS NULL;`. It should be 0 or very close; only appointments with an invalid email **and** phone stay unlinked.
- [ ] **Dashboard:** log in and open **Booked Appointments**.
  - Phone visits and Email visits show numbers.
  - First-time customers have a green **New** badge.
- [ ] **Customer site:** open the site and press F12 → Console. Book a test appointment with an email and phone **you have never used before**.
  - After the confirmation screen, type `dataLayer` and press Enter.
  - The last entry is `booking_completed` with `new_customer: true`.
- [ ] **Book again** with the same email. This time it shows `new_customer: false`.
- [ ] **Cancel both test appointments** in the dashboard. That client's visit counts go down right away.

## Rollback

1. Run `php artisan down`.
2. In phpMyAdmin, import the `.sql` backup. This restores the old tables and their counts.
3. Put back the 4 backed-up PHP files, and delete the 5 new files:
   - `Client.php`
   - `ClientIdentifier.php`
   - `ClientService.php`
   - the two `2026_11_05_*` migrations
4. Run `php artisan optimize:clear`, then `php artisan up`.
5. Re-extract the `release-2026-10-07-google-ads` `dashboard.zip` and `customer-website.zip`, then purge the CDN.

---

# Google Tag Manager setup (container `GTM-N5G6ZXP2`)

Go to <https://tagmanager.google.com> and open the container.

If you followed the 2026-10-07 release, you already have a `booking_completed` trigger and a Google Ads conversion tag. **Edit them; don't create duplicates.** Check each step and skip anything that already exists.

### 1. Variables

Go to **Variables → User-Defined Variables → New**. For each row, choose **Data Layer Variable**, enter the name, keep Version 2 and save:

| Variable name (what you call it) | Data Layer Variable Name |
| --- | --- |
| `DLV - new_customer` | `new_customer` |
| `DLV - transaction_id` | `transaction_id` |
| `DLV - value` | `value` |
| `DLV - currency` | `currency` |

For **user-provided data**, create a variable of type **User-Provided Data**. Choose **Manual configuration**. Set Email to a Data Layer Variable `user_data.email` and Phone to `user_data.phone_number`. Name it `UPD - booking`.

### 2. Trigger

Go to **Triggers → New → Custom Event**. Set Event name to `booking_completed`, fire on **All Custom Events**, and save it as `CE - booking_completed`.

### 3. Conversion tag

Go to **Tags → New → Google Ads → Google Ads Conversion Tracking**:

| Field | Value |
| --- | --- |
| Conversion ID | `18159569562` |
| Conversion Label | `6vkWCID6-rgcEJqVlNND` |
| Conversion Value | `{{DLV - value}}` |
| Transaction ID | `{{DLV - transaction_id}}` |
| Currency Code | `{{DLV - currency}}` |
| Include user-provided data from your website | ✅, then pick `{{UPD - booking}}` |
| **Provide new customer data** | ✅ |
| └ New customer | `{{DLV - new_customer}}` |
| Triggering | `CE - booking_completed` |

Save it as `Google Ads - Book Appointment`.

The ID and label come from the "TechSol - Book Appointment" conversion in Google Ads. GTM wants the two parts separately, so take them from the `send_to` value `AW-18159569562/6vkWCID6-rgcEJqVlNND`: the ID is the number after `AW-`, and the label is everything after the `/`.

**Don't paste the "Page load" or "Click" code snippet from Google Ads anywhere.** GTM sends the same thing, and pasting it too would count every booking twice.

### 4. Conversion Linker

Go to **Tags**. If there isn't a **Conversion Linker** tag, create one (**New → Conversion Linker**) with trigger **All Pages**.

### 5. Test, then publish

1. Click **Preview**, enter `https://alisbarbershop.com` and make a test booking.
2. In Tag Assistant, click the `booking_completed` event. **Google Ads - Book Appointment** should be under **Tags Fired**. Open it and check that **new_customer** shows `true` or `false`.
3. Close Preview. Click **Submit**, name the version "New customer conversion", then click **Publish**.
4. Cancel the test booking in the dashboard.

---

# Google Ads setup

Go to <https://ads.google.com>.

### 1. Finish the conversion action

1. Go to **Goals → Conversions → Summary** and open **TechSol - Book Appointment**.
2. If Google is still showing the "Choose how to measure conversions" screen from your screenshot, click **Cancel** or **Done**. Don't use either snippet; GTM handles it.
3. Under **Edit settings**, check that:
   - **Goal and action optimization:** Primary action. This is the one bidding uses.
   - **Value:** "Use different values for each conversion". The site sends the real booking price.
   - **Count:** One
   - **Click-through conversion window:** 30 days is fine.
4. Click **Save**.

### 2. Turn on Enhanced Conversions

Go to **Goals → Conversions → Settings → Enhanced conversions for web**. Turn it on, choose **Google Tag Manager** as the method and save. It uses the email and phone the tag already sends.

### 3. Turn on new customer acquisition

1. Go to **Goals → Customer acquisition** (some accounts show it as **Goals → Settings → Customer acquisition**).
2. **How to identify new customers:** pick **"Use conversion tags with new customer data"**. That's the `new_customer` value from this release. You can also add the customer list from the dashboard's **Export customers (Google Ads)** button, so Google learns from both.
3. **Bidding mode:** choose one.
   - **Bid higher for new customers** (recommended to start). Enter how much more a new customer is worth to you than a returning one. For example, if a new client usually comes back about 5 times, $50–$100 is reasonable.
   - **Only bid for new customers.** Google tries to show ads only to new people. Don't use this together with the "Booked customers" exclusion list from the last release; they do the same job.
4. Save the setting. Then in **each campaign → Settings → Customer acquisition**, tick **"Adjust your bidding to help acquire new customers"**. Performance Max and Search campaigns support this.

### 4. Wait, then check

- Within about 3 hours of a real booking, the conversion status changes from **Unverified** to **Recording conversions**. The new-customer data can take up to 24 hours to show.
- To see results, go to **Campaigns** and add the columns **New customers** and **New customer lifetime value** (Columns → Modify columns → Conversions).
- Google needs about **30 days** and about **15–30 conversions** before new-customer bidding settles. Don't change the setting during that time.
