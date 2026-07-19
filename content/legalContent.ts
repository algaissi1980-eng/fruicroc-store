// =============================================
// EU legal pages — DRAFTS for client/lawyer review.
// [BRACKETED] placeholders must be filled before launch.
// Rendered by app/[locale]/legal/[slug]/page.tsx
// Format: "## " lines become headings, blank lines separate paragraphs.
// =============================================

import type { Locale } from "@/i18n/routing";

export type LegalKey = "mentions" | "cgv" | "privacy" | "withdrawal";

export const legalContent: Record<LegalKey, Record<Locale, string>> = {
  mentions: {
    fr: `## Éditeur du site
Le site fruicroc.com est édité par [RAISON SOCIALE], [FORME JURIDIQUE] au capital de [CAPITAL] €, immatriculée au RCS de [VILLE] sous le numéro [SIREN], dont le siège social est situé [ADRESSE COMPLÈTE], France.

Numéro de TVA intracommunautaire : [NUMÉRO TVA]

Directrice de la publication : [NOM DE LA DIRIGEANTE]

Contact : [EMAIL] — [TÉLÉPHONE]

## Hébergement
Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com). Les données sont hébergées par Supabase (supabase.com) dans l'Union européenne.

## Propriété intellectuelle
L'ensemble des contenus du site (textes, images, logo, marque Fruicroc) est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation écrite préalable est interdite.`,
    en: `## Site publisher
The website fruicroc.com is published by [COMPANY NAME], a [LEGAL FORM] with share capital of €[CAPITAL], registered with the [CITY] Trade and Companies Register under number [SIREN], with registered office at [FULL ADDRESS], France.

EU VAT number: [VAT NUMBER]

Publication director: [DIRECTOR NAME]

Contact: [EMAIL] — [PHONE]

## Hosting
The site is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA (vercel.com). Data is hosted by Supabase (supabase.com) within the European Union.

## Intellectual property
All site content (texts, images, logo, the Fruicroc brand) is protected by intellectual property law. Any reproduction without prior written permission is prohibited.`,
    ar: `## ناشر الموقع
موقع fruicroc.com تنشره شركة [اسم الشركة]، [الشكل القانوني] برأس مال [رأس المال] يورو، مسجلة في السجل التجاري لمدينة [المدينة] تحت رقم [SIREN]، ومقرها [العنوان الكامل]، فرنسا.

رقم الضريبة الأوروبي: [رقم TVA]

مديرة النشر: [اسم المديرة]

للتواصل: [البريد الإلكتروني] — [الهاتف]

## الاستضافة
الموقع مستضاف لدى Vercel Inc.، 440 N Barranca Ave #4133, Covina, CA 91723، الولايات المتحدة (vercel.com). البيانات مستضافة لدى Supabase (supabase.com) داخل الاتحاد الأوروبي.

## الملكية الفكرية
جميع محتويات الموقع (نصوص، صور، شعار، علامة Fruicroc) محمية بقانون الملكية الفكرية. يُمنع أي نسخ دون إذن كتابي مسبق.`,
  },

  cgv: {
    fr: `## 1. Objet
Les présentes conditions générales de vente (CGV) régissent les ventes de produits alimentaires (fruits et légumes lyophilisés) réalisées sur le site fruicroc.com par [RAISON SOCIALE] auprès de consommateurs situés en France, Allemagne, Italie, Espagne, Pays-Bas, Belgique, Pologne, Portugal, Luxembourg et Autriche.

## 2. Produits
Les produits sont décrits avec la plus grande exactitude possible. Les photographies n'ont pas de valeur contractuelle. Les produits sont conformes à la réglementation alimentaire européenne en vigueur.

## 3. Prix
Les prix sont indiqués en euros, toutes taxes comprises (TTC). Le taux de TVA applicable est celui du pays de livraison. Les frais de livraison sont indiqués avant validation de la commande. [RAISON SOCIALE] se réserve le droit de modifier ses prix à tout moment ; les produits sont facturés au prix en vigueur au moment de la commande.

## 4. Commande
La commande est confirmée après validation du panier, des informations de livraison et du paiement. Un e-mail de confirmation récapitulatif est envoyé au client. La création d'un compte est nécessaire pour commander.

## 5. Paiement
Le paiement s'effectue soit par PayPal, soit par virement bancaire. En cas de virement, la commande est enregistrée « en attente de paiement » et n'est préparée qu'à réception effective des fonds. À défaut de paiement sous [X] jours, la commande est annulée.

## 6. Livraison
Les livraisons sont assurées dans les pays listés à l'article 1, aux frais indiqués lors de la commande. Délais indicatifs : [X à Y] jours ouvrés à compter de l'encaissement. En cas de retard de plus de 30 jours, le client peut annuler la commande et obtenir remboursement.

## 7. Droit de rétractation
Conformément aux articles L221-18 et suivants du Code de la consommation, le client dispose de 14 jours à compter de la réception pour se rétracter, sans motif. Exception (article L221-28) : le droit de rétractation ne peut être exercé pour les denrées descellées après la livraison pour des raisons d'hygiène et de protection de la santé. Voir la page « Droit de rétractation » pour les modalités.

## 8. Garanties
Les produits bénéficient des garanties légales de conformité (articles L217-3 et suivants du Code de la consommation) et des vices cachés (articles 1641 et suivants du Code civil).

## 9. Réclamations et litiges
Service client : [EMAIL]. Conformément aux articles L616-1 et R616-1 du Code de la consommation, le client peut recourir gratuitement au médiateur de la consommation : [MÉDIATEUR À DÉSIGNER]. Plateforme européenne de règlement en ligne des litiges : ec.europa.eu/consumers/odr. Le droit français s'applique, sans priver le consommateur des dispositions impératives de son pays de résidence.`,
    en: `## 1. Purpose
These terms and conditions of sale govern sales of food products (freeze-dried fruits and vegetables) on fruicroc.com by [COMPANY NAME] to consumers located in France, Germany, Italy, Spain, the Netherlands, Belgium, Poland, Portugal, Luxembourg and Austria.

## 2. Products
Products are described as accurately as possible. Photographs are not contractually binding. Products comply with applicable European food regulations.

## 3. Prices
Prices are shown in euros, inclusive of VAT. The applicable VAT rate is that of the delivery country. Delivery costs are shown before the order is confirmed. Products are invoiced at the price in force at the time of ordering.

## 4. Ordering
An order is confirmed after validation of the cart, delivery details and payment. A confirmation email is sent to the customer. An account is required to place an order.

## 5. Payment
Payment is made either by PayPal or by bank transfer. For bank transfers, the order is recorded as "awaiting payment" and is only prepared once the funds are received. If payment is not received within [X] days, the order is cancelled.

## 6. Delivery
Deliveries are made to the countries listed in section 1, at the costs shown at checkout. Indicative delivery time: [X to Y] working days from receipt of payment. If delivery is delayed by more than 30 days, the customer may cancel and be refunded.

## 7. Right of withdrawal
In accordance with EU consumer law, the customer has 14 days from receipt to withdraw without giving a reason. Exception: the right of withdrawal cannot be exercised for food items unsealed after delivery, for hygiene and health-protection reasons. See the "Right of withdrawal" page for details.

## 8. Warranties
Products are covered by the legal warranties of conformity and against hidden defects under French and EU consumer law.

## 9. Complaints and disputes
Customer service: [EMAIL]. The customer may use the free consumer mediation service: [MEDIATOR TO BE APPOINTED]. EU online dispute resolution platform: ec.europa.eu/consumers/odr. French law applies, without depriving consumers of the mandatory provisions of their country of residence.`,
    ar: `## 1. الموضوع
تنظّم هذه الشروط العامة للبيع مبيعات المنتجات الغذائية (فواكه وخضروات مجففة بالتجميد) عبر موقع fruicroc.com من قبل [اسم الشركة] للمستهلكين في فرنسا وألمانيا وإيطاليا وإسبانيا وهولندا وبلجيكا وبولندا والبرتغال ولوكسمبورغ والنمسا.

## 2. المنتجات
تُوصف المنتجات بأكبر دقة ممكنة. الصور غير ملزمة تعاقدياً. المنتجات مطابقة للوائح الغذاء الأوروبية السارية.

## 3. الأسعار
الأسعار باليورو شاملة الضريبة. تُطبق نسبة ضريبة القيمة المضافة الخاصة بدولة التوصيل. تُعرض تكاليف الشحن قبل تأكيد الطلب. تُحتسب المنتجات بالسعر الساري وقت الطلب.

## 4. الطلب
يُؤكد الطلب بعد التحقق من السلة وبيانات التوصيل والدفع، ويُرسل بريد تأكيد للعميل. يلزم إنشاء حساب لإتمام الطلب.

## 5. الدفع
يتم الدفع عبر PayPal أو التحويل البنكي. في حالة التحويل، يُسجل الطلب «بانتظار الدفع» ولا يُجهز إلا بعد وصول المبلغ فعلياً. إذا لم يصل الدفع خلال [X] أيام يُلغى الطلب.

## 6. التوصيل
يتم التوصيل إلى الدول المذكورة في البند 1 بالتكاليف المعروضة عند الطلب. المدة التقريبية: [من X إلى Y] أيام عمل من استلام الدفع. إذا تأخر التسليم أكثر من 30 يوماً يحق للعميل الإلغاء واسترداد المبلغ.

## 7. حق الرجوع
وفقاً لقانون المستهلك الأوروبي، يحق للعميل الرجوع خلال 14 يوماً من الاستلام دون إبداء سبب. استثناء: لا يسري حق الرجوع على المنتجات الغذائية التي فُتح غلافها بعد التسليم لأسباب صحية. راجع صفحة «حق الرجوع» للتفاصيل.

## 8. الضمانات
تخضع المنتجات للضمانات القانونية للمطابقة وضد العيوب الخفية وفق القانونين الفرنسي والأوروبي.

## 9. الشكاوى والنزاعات
خدمة العملاء: [البريد الإلكتروني]. يمكن للعميل اللجوء مجاناً إلى وسيط المستهلك: [يُحدد لاحقاً]. منصة الاتحاد الأوروبي لتسوية النزاعات: ec.europa.eu/consumers/odr. يُطبق القانون الفرنسي دون حرمان المستهلك من الأحكام الإلزامية في بلد إقامته.`,
  },

  privacy: {
    fr: `## Responsable du traitement
[RAISON SOCIALE], [ADRESSE], [EMAIL].

## Données collectées
Compte client (e-mail), commandes (nom, téléphone, adresse de livraison), historique d'achats, et statistiques de visite anonymisées (nombre de pages vues par jour, sans profilage individuel).

## Finalités et bases légales
Exécution du contrat de vente (traitement des commandes, livraison), obligation légale (facturation, comptabilité), et intérêt légitime (statistiques de fréquentation, prévention de la fraude).

## Sous-traitants
Supabase (base de données et authentification, hébergement UE), Vercel (hébergement du site), PayPal (paiement). Aucune donnée n'est vendue à des tiers.

## Durée de conservation
Données de compte : jusqu'à suppression du compte. Données de commande et de facturation : 10 ans (obligation comptable).

## Vos droits
Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de limitation, de portabilité et d'opposition. Pour les exercer : [EMAIL]. Vous pouvez introduire une réclamation auprès de la CNIL (cnil.fr).

## Cookies
Le site utilise des cookies strictement nécessaires (session de connexion, panier, préférence de langue) et, avec votre consentement, des cookies de mesure d'audience. Vous pouvez accepter ou refuser les cookies non essentiels via le bandeau de consentement.`,
    en: `## Data controller
[COMPANY NAME], [ADDRESS], [EMAIL].

## Data collected
Customer account (email), orders (name, phone, delivery address), purchase history, and anonymised visit statistics (daily page views, no individual profiling).

## Purposes and legal bases
Performance of the sales contract (order processing, delivery), legal obligation (invoicing, accounting), and legitimate interest (traffic statistics, fraud prevention).

## Processors
Supabase (database and authentication, EU hosting), Vercel (site hosting), PayPal (payments). No data is sold to third parties.

## Retention
Account data: until account deletion. Order and invoicing data: 10 years (accounting obligation).

## Your rights
Under the GDPR you have the rights of access, rectification, erasure, restriction, portability and objection. To exercise them: [EMAIL]. You may lodge a complaint with your supervisory authority (in France: CNIL, cnil.fr).

## Cookies
The site uses strictly necessary cookies (login session, cart, language preference) and, with your consent, audience-measurement cookies. You can accept or reject non-essential cookies via the consent banner.`,
    ar: `## المسؤول عن معالجة البيانات
[اسم الشركة]، [العنوان]، [البريد الإلكتروني].

## البيانات المجموعة
حساب العميل (البريد الإلكتروني)، الطلبات (الاسم، الهاتف، عنوان التوصيل)، سجل المشتريات، وإحصائيات زيارة مجهولة الهوية (عدد مشاهدات الصفحات يومياً، دون تتبع فردي).

## الأغراض والأسس القانونية
تنفيذ عقد البيع (معالجة الطلبات والتوصيل)، الالتزام القانوني (الفوترة والمحاسبة)، والمصلحة المشروعة (إحصائيات الزيارات ومنع الاحتيال).

## المعالجون
Supabase (قاعدة البيانات والمصادقة، استضافة أوروبية)، Vercel (استضافة الموقع)، PayPal (الدفع). لا تُباع أي بيانات لأطراف ثالثة.

## مدة الاحتفاظ
بيانات الحساب: حتى حذف الحساب. بيانات الطلبات والفوترة: 10 سنوات (التزام محاسبي).

## حقوقك
بموجب اللائحة العامة لحماية البيانات (GDPR) لديك حقوق الوصول والتصحيح والحذف وتقييد المعالجة ونقل البيانات والاعتراض. لممارستها: [البريد الإلكتروني]. يمكنك تقديم شكوى لدى سلطة حماية البيانات (في فرنسا: CNIL — cnil.fr).

## ملفات تعريف الارتباط
يستخدم الموقع ملفات ضرورية فقط (جلسة الدخول، السلة، تفضيل اللغة)، وبموافقتك ملفات قياس الزيارات. يمكنك القبول أو الرفض عبر شريط الموافقة.`,
  },

  withdrawal: {
    fr: `## Délai de 14 jours
Conformément aux articles L221-18 et suivants du Code de la consommation, vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier de motif.

## Exception — produits alimentaires descellés
Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les produits descellés après la livraison et ne pouvant être renvoyés pour des raisons d'hygiène ou de protection de la santé. Les sachets ouverts ne peuvent donc pas être retournés.

## Comment exercer ce droit
Notifiez-nous votre décision par e-mail à [EMAIL] avant l'expiration du délai, par déclaration dénuée d'ambiguïté ou via le formulaire ci-dessous. Retournez les produits non ouverts, dans leur emballage d'origine, sous 14 jours à l'adresse : [ADRESSE DE RETOUR]. Les frais de retour sont à votre charge.

## Remboursement
Nous vous remboursons la totalité des sommes versées, y compris les frais de livraison standard, au plus tard 14 jours après récupération des produits ou preuve d'expédition, via le même moyen de paiement.

## Formulaire type de rétractation
« À l'attention de [RAISON SOCIALE], [ADRESSE], [EMAIL] : Je vous notifie par la présente ma rétractation du contrat portant sur la vente des produits ci-dessous : [produits] — Commandé le [date] / reçu le [date] — Nom et adresse du consommateur — Signature (si papier) — Date. »`,
    en: `## 14-day period
In accordance with EU consumer law, you have 14 days from receipt of your order to exercise your right of withdrawal, without giving any reason.

## Exception — unsealed food products
The right of withdrawal cannot be exercised for products unsealed after delivery that cannot be returned for hygiene or health-protection reasons. Opened pouches therefore cannot be returned.

## How to exercise this right
Notify us of your decision by email at [EMAIL] before the period expires, by an unambiguous statement or using the model form below. Return the unopened products, in their original packaging, within 14 days to: [RETURN ADDRESS]. Return costs are at your expense.

## Refund
We will refund all sums paid, including standard delivery costs, no later than 14 days after recovering the products or receiving proof of shipment, using the same payment method.

## Model withdrawal form
"To [COMPANY NAME], [ADDRESS], [EMAIL]: I hereby give notice that I withdraw from my contract of sale of the following products: [products] — Ordered on [date] / received on [date] — Name and address of consumer — Signature (if on paper) — Date."`,
    ar: `## مهلة 14 يوماً
وفقاً لقانون المستهلك الأوروبي، لديك 14 يوماً من استلام طلبك لممارسة حق الرجوع دون إبداء أي سبب.

## استثناء — المنتجات الغذائية المفتوحة
لا يسري حق الرجوع على المنتجات التي فُتح غلافها بعد التسليم والتي لا يمكن إرجاعها لأسباب تتعلق بالنظافة وحماية الصحة. لذلك لا يمكن إرجاع الأكياس المفتوحة.

## كيفية ممارسة هذا الحق
أبلغنا بقرارك عبر البريد الإلكتروني [البريد الإلكتروني] قبل انتهاء المهلة، ببيان واضح أو باستخدام النموذج أدناه. أعد المنتجات غير المفتوحة بعبوتها الأصلية خلال 14 يوماً إلى: [عنوان الإرجاع]. تكاليف الإرجاع على عاتقك.

## استرداد المبلغ
نعيد لك كامل المبالغ المدفوعة، بما فيها تكاليف الشحن العادية، خلال مدة أقصاها 14 يوماً من استلام المنتجات أو إثبات إرسالها، بنفس وسيلة الدفع.

## نموذج الرجوع
«إلى [اسم الشركة]، [العنوان]، [البريد الإلكتروني]: أُخطركم بموجب هذا برجوعي عن عقد بيع المنتجات التالية: [المنتجات] — تاريخ الطلب [التاريخ] / تاريخ الاستلام [التاريخ] — اسم المستهلك وعنوانه — التوقيع (إن كان ورقياً) — التاريخ.»`,
  },
};
