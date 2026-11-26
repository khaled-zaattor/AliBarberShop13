# Release 2026-11-09: hours, address and content fixes (customer website only)

This release makes the website agree with itself and with the Google listing.

- **Hours:** open 7 days. Mon–Fri 9:00 AM – 8:00 PM, Sat 9:00 AM – 7:00 PM, Sun 9:00 AM – 3:00 PM. These now appear the same in the footer, the Find Us section, the FAQ, the Google structured data and `llms.txt`. They match the dashboard's Business Hours.
- **Address:** now `4201 62nd Ave N, Unit 9` everywhere, the same as Google.
- **Prices:** the top of the homepage shows `$30`, not `$30 & Up`, so it matches the services list and the FAQ.
- **Beard time:** the FAQ now says 30 min for the Beard Line Up & Shave and 20 min for a Full Edge, as the services list does.
- **Reviews:** each review now appears once in the page's HTML. The scrolling loop still works on screen.
- **Booking:** the `#booking` section is now in the page HTML even before the calendar loads. If the calendar fails to load, visitors see the phone number and a **Try again** button.

## What's in it

| Part | In this release? |
| --- | --- |
| Customer website (`alisbarbershop.com`) | **Yes**, `customer-website.zip` (44 files) |
| Dashboard | No |
| Laravel API / database | No. No PHP files, no migrations. |

**Depends on the 2026-11-05 release.** This build also includes the customer-site part of the 2026-11-05 "new customer" release. If the 11-05 API changes are already live, nothing else is needed. If they aren't, the site still works and bookings still go through, but Google Ads will see every booking as a returning customer until you deploy the 11-05 API.

## Before you start

1. **Back up the live site.** In hPanel, go to **Websites → Manage → Files → File Manager** and open `public_html`. Download `index.html` and `.htaccess` at minimum.
2. **Check that the download isn't corrupted.** In PowerShell, from this folder, run the command below. The result should match `SHA256SUMS.txt`.
   ```powershell
   Get-FileHash .\customer-website.zip -Algorithm SHA256
   ```

## Deploy

1. In **File Manager**, open `public_html`.
2. **Upload** `customer-website.zip` into `public_html`.
3. Right-click the zip, choose **Extract**, and extract it into `public_html` itself, not into a new subfolder. Allow it to **overwrite** existing files. Afterwards you should see `index.html`, `services/`, `faq/` and so on directly inside `public_html`.
   - Don't delete the old files in `public_html/assets/`. Visitors with an open tab may still need them.
4. If you had added custom lines to the live `.htaccess`, put them back near the top of the new one.
5. **Delete** `customer-website.zip` from `public_html`.
6. **Purge the CDN cache.** Go to **Websites → Manage → Performance → CDN → Purge all**. If LiteSpeed Cache is on, purge that too.

The site stays up the whole time.

## Verify

```powershell
curl.exe -s https://alisbarbershop.com/ | Select-String -SimpleMatch "9:00 AM – 8:00 PM" | Measure-Object | % Count   # 1 or more
curl.exe -s https://alisbarbershop.com/ | Select-String -SimpleMatch "62nd Ave N" | Measure-Object | % Count          # 1 or more
curl.exe -s https://alisbarbershop.com/ | Select-String -SimpleMatch "8:30" | Measure-Object | % Count                # 0
curl.exe -s https://alisbarbershop.com/ | Select-String -SimpleMatch 'id="booking"' | Measure-Object | % Count        # 1
```

If you still see `8:30`, the CDN is serving the old copy. Purge it again.

On your phone:

- [ ] Tap **Book Now** at the top of the homepage. The booking calendar opens, and you can pick a service, a barber, and a Sunday or Monday date.
- [ ] **Book a real test appointment**, then cancel it in the dashboard.
- [ ] The footer and the Find Us section show the new hours.

## Still to do by hand (outside the website)

- **Google Business Profile:** change Mon–Fri closing from 9:00 PM to **8:00 PM**, and check that the address reads `4201 62nd Ave N, Unit 9`.
- **Name:** the website uses **Ali's Barber Shop**. Use exactly that spelling on Google, Booksy, Instagram, Facebook and in campaign captions.
